// SEE YOU IN 2017
const promisify = require('es6-promisify')

const {join, resolve, basename} = require('path')

const log = require('npmlog')
const mkdirp = promisify(require('mkdirp'))
const mv = promisify(require('mv'))
const stat = promisify(require('fs').stat)

const moveTracker = log.newGroup('placing tracks')

function place (albums, newRoot) {
  const tracker = moveTracker.newItem('moving albums', albums.size)
  return Promise.all(
    [...albums].map(album => {
      const albumPath = join(newRoot, album.toPath())
      return mkdirp(albumPath).then(() => {
        log.silly('place', 'created', albumPath)
        const tracker = moveTracker.newItem(
          'tracks to ' + albumPath,
          album.tracks.length,
          2
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
              return mv(track.path, destination).then(() => {
                track.path = destination
                tracker.completeWork(1)
              })
            })
          })
        )
      }).then(() => {
        const tracker = moveTracker.newItem(
          'covers to ' + albumPath,
          album.pictures.length,
          2
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
      }
      ).then(() => tracker.completeWork(1))
    })
  ).then(() => albums)
}

function moveToArchive (albums, root) {
  const tracker = moveTracker.newItem('archiving zip files', albums.size)
  return mkdirp(root).then(() => Promise.all(
    [...albums].map(album => {
      const file = album.sourceArchive
      const destination = join(root, basename(file))
      if (!file) {
        return Promise.reject(
          new Error(album.name + ' must have source archive path set.')
        )
      }
      log.verbose('moveToArchive', 'moving', file, 'to', destination)
      return stat(destination).then(() => {
        log.warn('moveToArchive', destination, 'already exists; not overwriting')
        tracker.completeWork(1)
      }).catch((er) => {
        if (er.code !== 'ENOENT') throw er
        return mv(file, destination).then(() => {
          album.destArchive = destination
          tracker.completeWork(1)
        })
      })
    })
  ))
}

module.exports = { place, moveToArchive }
