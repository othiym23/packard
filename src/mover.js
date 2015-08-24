// SEE YOU IN 2017

const Promise = require('bluebird')
const promisify = Promise.promisify

const {join, resolve, basename} = require('path')

const log = require('npmlog')
const mkdirp = promisify(require('mkdirp'))
const mv = promisify(require('mv'))
const stat = promisify(require('fs').stat)

function place (albums, newRoot, groups) {
  return Promise.all(
    [...albums].map(album => {
      const albumPath = join(newRoot, album.toPath())
      const trackerGroup = groups.get(album.sourceArchive.path)
      return mkdirp(albumPath).then(() => {
        log.silly('place', 'created', albumPath)
        const tracker = trackerGroup.newItem(
          'moving tracks: ' + albumPath,
          album.tracks.length
        )

        return Promise.all(
          album.tracks.map(track => {
            const destination = resolve(
              newRoot,
              album.toPath(),
              track.safeName()
            )

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
          })
        )
      }).then(() => {
        const tracker = trackerGroup.newItem(
          'covers to ' + albumPath,
          album.pictures.length
        )

        return Promise.all(
          album.pictures.map(picture => {
            const destination = resolve(
              newRoot,
              album.toPath(),
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
          })
        )
      })
    })
  ).then(() => albums)
}

function moveToArchive (albums, root, groups) {
  return mkdirp(root).then(() => Promise.all(
    [...albums].map(album => {
      const archive = album.sourceArchive
      const trackerGroup = groups.get(archive)
      const tracker = trackerGroup.newItem('archiving: ' + archive, albums.size)
      const destination = join(root, basename(archive))
      if (!archive) {
        return Promise.reject(
          new Error(album.name + ' must have source archive path set.')
        )
      }
      log.verbose('moveToArchive', 'moving', archive, 'to', destination)
      return stat(destination).then(() => {
        log.warn('moveToArchive', destination, 'already exists; not overwriting')
        tracker.completeWork(1)
      }).catch((er) => {
        if (er.code !== 'ENOENT') throw er
        return mv(archive, destination).then(() => {
          album.destArchive = destination
          tracker.completeWork(1)
        })
      })
    })
  ))
}

module.exports = { place, moveToArchive }
