import fs from 'graceful-fs'

import { join, resolve, basename } from 'path'

import log from 'npmlog'
import mkdirpCB from 'mkdirp'
import mvCB from 'mv'
import { Archive } from '@packard/model'
import Bluebird from 'bluebird'

const mkdirp = Bluebird.promisify(mkdirpCB)
const mv = Bluebird.promisify(mvCB)
const stat = Bluebird.promisify(fs.stat)

export function place (albums, newRoot, groups) {
  return Bluebird.map(
    [...albums],
    (album) => {
      const albumPath = join(newRoot, album.toSafePath())
      const trackerGroup = groups.get(album.sourceArchive.path)
      return mkdirp(albumPath).then(() => {
        log.silly('place', 'created', albumPath)
        const tracker = trackerGroup.newItem(
          'moving tracks: ' + albumPath,
          album.tracks.length
        )

        return Bluebird.map(
          album.tracks,
          (track) => {
            const destination = resolve(newRoot, album.toSafePath(), track.safeName())

            return stat(destination).then(() => {
              log.warn('place', destination, 'already exists; not overwriting')
              tracker.completeWork(1)
            }).catch((er) => {
              if (er.code !== 'ENOENT') throw er
              log.silly('place', 'moving', track.file.path, 'to', destination)
              return mv(track.file.path, destination).then(() => {
                track.file.path = destination
                tracker.completeWork(1)
              })
            })
          }
        )
      }).then(() => {
        if (!album.pictures.length) return

        const tracker = trackerGroup.newItem(
          'covers to ' + albumPath,
          album.pictures.length
        )

        return Bluebird.map(
          album.pictures,
          (picture) => {
            const destination = resolve(
              newRoot,
              album.toSafePath(),
              basename(picture.path)
            )

            return stat(destination).then(() => {
              log.warn('place', destination, 'already exists; not overwriting')
              tracker.completeWork(1)
            }).catch((er) => {
              if (er.code !== 'ENOENT') throw er
              return mv(picture.path, destination).then(() => {
                picture.path = destination
                tracker.completeWork(1)
              })
            })
          }
        )
      })
    }
  ).then(() => albums)
}

export function moveToArchive (albums, root, groups) {
  return mkdirp(root).then(() => Bluebird.map(
    [...albums],
    (album) => {
      const archive = album.sourceArchive && album.sourceArchive.path
      if (!archive) {
        throw new Error(album.name + ' must have source archive path set.')
      }
      log.verbose('moveToArchive', 'finding progress bar for', archive)
      const trackerGroup = groups.get(archive)
      const tracker = trackerGroup.newItem('archiving: ' + archive, albums.size)
      const destination = join(root, basename(archive))
      log.verbose('moveToArchive', 'moving', archive, 'to', destination)
      return stat(destination).then(() => {
        log.warn('moveToArchive', destination, 'already exists; not overwriting')
        tracker.completeWork(1)
      }).catch((er) => {
        if (er.code !== 'ENOENT') throw er
        return mv(archive, destination)
          .then(() => stat(destination))
          .then((stats) => {
            album.destArchive = new Archive(
              destination,
              stats,
              { info: album.sourceArchive.info }
            )
            tracker.completeWork(1)
          })
      })
    }
  ))
}
