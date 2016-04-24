import { writeFile as writeFileCB, stat as statCB } from 'graceful-fs'
import { join, resolve } from 'path'
import { randomBytes } from 'crypto'
import { tmpdir } from 'os'

import globCB from 'glob'
import log from 'npmlog'
import rimrafCB from 'rimraf'
import Bluebird from 'bluebird'
import { unpack as unzip } from '../utils/zip.js'

import albumsFromTracks from '../metadata/albums-from-tracks.js'
import makePlaylist from '../utils/make-playlist.js'
import toModel from '../fs/to-model.js'
import { moveToArchive, place } from '../mover.js'

import { promisify } from 'bluebird'
const glob = promisify(globCB)
const rimraf = promisify(rimrafCB)
const stat = promisify(statCB)
const writeFile = promisify(writeFileCB)

const tmp = join(tmpdir(), 'packard-' + randomBytes(8).toString('hex'))

export default function unpack (target = {}, staging, archiveRoot, playlist) {
  log.enableProgress()

  const { roots = [], pattern, files = [] } = target
  log.silly('unpack', 'initial files', files)

  let paths
  if (roots.length && pattern) {
    paths = Bluebird.map(
      roots,
      (path) => glob(join(path, pattern))
    ).then((lists) => lists.reduce((a, c) => a.concat(c), files))
  } else {
    paths = Bluebird.resolve(files)
  }
  paths = paths.then((expanded) => {
    log.silly('unpack', 'expanded files', expanded)
    return expanded
  })

  let maybeFiltered = paths
  // don't reprocess stuff that's already been archived
  if (archiveRoot) {
    maybeFiltered = paths.filter((f) => resolve(f).indexOf(archiveRoot) === -1)
  }
  maybeFiltered = maybeFiltered.then((culled) => {
    if (culled.length === 0) {
      log.info('unpack', 'no archives to process! CU L8R SAILOR')
    } else {
      log.silly('unpack', 'after filtering', culled)
    }
    return culled
  })

  const groups = new Map()
  let albums = maybeFiltered.then((files) => {
    log.verbose('unpack', 'unpacking', files)
    // do this so that the progress bar accurately tracks the list of files
    files.forEach((f) => groups.set(f, log.newGroup('process: ' + f)))
    return files
  }).map(
    (f) => unzip(f, groups, tmp).map(toType),
    { concurrency: 2 }
  ).then(albumsFromTracks)

  let placed = albums.then((albums) => place(albums, staging, groups))
  if (archiveRoot) {
    placed = placed.then(
      (archives) => moveToArchive(archives, archiveRoot, groups).return(archives)
    )
  }

  let reported = placed.then((albums) => {
    log.disableProgress()
    report(albums, staging)
    if (archiveRoot) reportArchived(albums)
    log.silly('unpack', 'removing', tmp)
    return rimraf(tmp).return(albums)
  })

  if (playlist) {
    return reported.then((albums) => {
      return writeFile(playlist, makePlaylist(albums), 'utf-8')
        .return(albums)
    })
  } else {
    return reported
  }
}

function report (albums, root, archives, archiveRoot) {
  const sorted = [...albums].sort((first, second) => {
    let result = first.getDate().localeCompare(second.getDate())
    if (result !== 0) return result

    return first.toSafePath().toLowerCase().localeCompare(second.toSafePath().toLowerCase())
  })
  if (!sorted.length) return

  console.log('new albums from this run:\n')
  for (let album of sorted) console.log(join(root, album.toSafePath()))

  console.log('\nfull details:\n')
  for (let album of sorted) console.log(album.dump())
}

function reportArchived (albums) {
  const archived = [...albums].filter((a) => a.destArchive)
  if (archived.length === 0) return

  console.log('now archived:\n')
  for (let album of archived) {
    console.log(album.sourceArchive.path, '\n  ->', album.destArchive.path)
  }
}

function toType ({ path, sourceArchive, extractedTrack }) {
  return stat(path).then((stats) => {
    const fsModel = toModel(path, stats)
    // this needs to close over the domain of types returned by toModel
    const model = extractedTrack || fsModel.cover || fsModel.cuesheet || fsModel.file

    model.sourceArchive = sourceArchive
    if (fsModel.fsTrack) model.fsTrack = fsModel.fsTrack
    if (fsModel.fsAlbum) model.fsAlbum = fsModel.fsAlbum
    if (fsModel.fsArtist) model.fsArtist = fsModel.fsArtist

    return model
  })
}
