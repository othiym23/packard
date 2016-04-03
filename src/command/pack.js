import { basename, join, resolve } from 'path'
import { createReadStream, createWriteStream, link as linkCB } from 'graceful-fs'

import log from 'npmlog'
import mkdirpCB from 'mkdirp'
import Bluebird from 'bluebird'

import blockSizeFromPath from '../utils/block-size.js'
import freeBlocksFromPath from '../utils/free-space.js'
import optimize from '../utils/knapsack-albums.js'
import { bySize } from '../utils/sort.js'
import { scanAlbums } from './albums.js'

import { promisify } from 'bluebird'
const link = promisify(linkCB)
const mkdirp = promisify(mkdirpCB)

const progressGroups = new Map()

export default function pack (sources, destination, blockSize) {
  log.enableProgress()

  const getBlockSize = blockSizeFromPath(destination)

  const sizeDestination = getBlockSize
    .then((blockBytes) => [
      blockBytes,
      freeBlocksFromPath(destination, blockBytes)
    ]).all()

  return sizeDestination.spread((blockBytes, { available }) => {
    return scanAlbums(sources, progressGroups).then((albums) => {
      const { included, discarded } = optimize(albums, available, blockBytes)

      let usedBlocks = 0
      for (let album of included.sort(bySize)) {
        log.silly(
          'pack',
          'including %s [%s %s-blocks]',
          album.path, album.getSize(blockBytes), blockBytes
        )
        const group = log.newGroup('placing: ' + album.name)
        progressGroups.set(album.path, group)
        usedBlocks += album.getSize(blockBytes)
      }

      let overflowBlocks = 0
      for (let album of discarded.sort(bySize)) {
        log.silly(
          'pack',
          'discarding %s [%s %s-blocks]',
          album.path, album.getSize(blockBytes), blockBytes
        )
        overflowBlocks += album.getSize(blockBytes)
      }

      log.verbose('pack', '%s has %d available %d-blocks', destination, available, blockBytes)
      const neededBlocks = [...albums].reduce((c, a) => c + a.getSize(blockBytes), 0)
      log.verbose('pack', 'need %d blocks for %d releases', neededBlocks, albums.size)
      log.verbose('pack', 'copying %d blocks with %d not making it', usedBlocks, overflowBlocks)
      log.verbose('pack', '%d blocks probably left over when done', available - usedBlocks)

      return partition(included)
        .mapSeries(([type, albums]) => copyTracks(destination, type, albums, blockBytes))
        .then(
          (byType) => freeBlocksFromPath(destination, blockBytes)
            .then((sizes) => {
              log.disableProgress()
              log.verbose('pack', '%d blocks left over when done', sizes.available)
              report(destination, byType, sizes, blockBytes)
            })
        )
    })
  })
}

export function partition (albums) {
  let byType = new Map()
  for (let album of albums) {
    let types = new Map()
    for (let track of album.tracks) {
      const type = track.file.ext.slice(1)
      if (!types.get(type)) types.set(type, 0)
      types.set(type, types.get(type) + 1)
    }
    const most = [...types.entries()].sort((a, b) => a[1] < b[1])[0][0]
    if (types.entries().size > 1) {
      log.warn('partition', album.name, 'has types', types.keys())
    }
    log.silly('partition', album.name, 'is of type', most)
    if (!byType.get(most)) byType.set(most, [])
    byType.get(most).push(album)
  }

  return Bluebird.resolve(byType)
}

function copyTrack (track, destination) {
  const gauge = progressGroups.get(basename(track.file.path))
  return new Bluebird((resolve, reject) => {
    createReadStream(track.file.path)
      .on('error', reject)
      .pipe(gauge.newStream('copying: ' + track.safeName(), track.file.stats.size))
      .pipe(createWriteStream(destination))
      .on('error', reject)
      .on('finish', () => {
        gauge.verbose('copyTrack', 'copied', track.file.path, 'to', destination)
        resolve()
      })
  })
}

function linkOrCopyTrack (track, folder) {
  const destination = join(folder, track.safeName())
  return link(
    track.file.path,
    join(folder, track.safeName())
  ).then(() => {
    log.verbose('linkOrCopyTrack', 'linked', track.file.path, 'to', destination)
  }).catch(
    { code: 'EXDEV' },
    () => {
      log.silly('linkOrCopyTrack', "can't link", track.file.path, 'to', destination)
      return copyTrack(track, destination)
    }
  )
}

function copyTracks (destination, type, albums) {
  return Bluebird.mapSeries(albums, (album) => {
    const folder = join(destination, type, album.toSafePath())
    log.silly('copyTracks', 'creating folder', folder)
    return mkdirp(folder)
      .then(() => Bluebird.mapSeries(
        album.tracks,
        (track) => linkOrCopyTrack(track, folder)
      ))
  }).return({ type, albums })
}

function report (root, byType, sizes, blockBytes) {
  console.log('packed:')
  const byPath = new Map()
  for (let { type, albums } of [].concat(...byType)) {
    for (let album of albums) byPath.set(resolve(root, type, album.toSafePath()), album)
  }

  for (let [path, album] of [...byPath].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log('%s {%d blocks}', path, album.getSize(blockBytes))
  }

  console.log(
    '%d %d-byte blocks used on device, %d remaining',
    sizes.used, blockBytes, sizes.available
  )
}
