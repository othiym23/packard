var createReadStream = require('fs').createReadStream
var createWriteStream = require('fs').createWriteStream
var dirname = require('path').dirname
var resolve = require('path').resolve
var spawn = require('child_process').spawn

var concat = require('mississippi').concat
var log = require('npmlog')
var pipe = require('mississippi').pipe
var Bluebird = require('bluebird')

var promisify = Bluebird.promisify
var mkdirp = promisify(require('mkdirp'))
var which = promisify(require('which'))

function makeAlbum (root, tracks, source) {
  if (!source) source = resolve(__dirname, '../fixtures/empty.flac')

  var ensureMetaflac = which('metaflac')

  return ensureMetaflac.then(function (metaflac) {
    return Bluebird.mapSeries(tracks, function (track) {
      var destination = track.file.path

      var tags = [
        'ARTIST=' + track.artist.name,
        'TITLE=' + track.name,
        'ALBUM=' + track.album.name,
        'TRACKNUMBER=' + track.index,
        'DATE=' + track.date
      ]
      if (track.tags && track.tags.genre) {
        tags.push('GENRE=' + track.tags.genre)
      }

      var ensureDestinationFolder = mkdirp(dirname(destination))

      var duplicate = ensureDestinationFolder.then(function () {
        return copy(source, destination)
      })

      var removeTags = duplicate.then(function () {
        return new Bluebird(function (resolve, reject) {
          var cleaner = spawn(
            metaflac,
            [
              '--remove-all',
              destination
            ],
            {}
          )

          pipe(cleaner.stdout, concat({ encoding: 'string' }, function (output) {
            if (output) log.silly('makeAlbum.removeTags', output)
          }))

          pipe(cleaner.stderr, concat({ encoding: 'string' }, function (output) {
            if (output) return reject(new Error(output))
          }))

          cleaner.on('error', reject)
          cleaner.on('close', function (code) {
            if (code !== 0) {
              return reject(new Error('metaflac exited with error status of ' + code))
            }
            log.verbose('makeAlbum.removeTags', 'removed existing tags from', destination)
            resolve()
          })
        })
      })

      var setTags = removeTags.then(function () {
        return new Bluebird(function (resolve, reject) {
          log.silly('makeAlbum.setTags', tags.join('\n'))
          var tagger = spawn(
            metaflac,
            [
              '--import-tags-from=-',
              destination
            ],
            {}
          )

          pipe(tagger.stdout, concat({ encoding: 'string' }, function (output) {
            if (output.toString()) log.silly('makeAlbum.setTags', output)
          }))

          pipe(tagger.stderr, concat({ encoding: 'string' }, function (output) {
            if (output) return reject(new Error(output))
          }))

          tagger.on('error', reject)
          tagger.on('close', function (code) {
            if (code !== 0) {
              return reject(new Error('metaflac exited with error status of ' + code))
            }
            log.silly('makeAlbum.pipe', 'copied and tagged', destination)
            resolve(destination)
          })

          tagger.stdin.write(tags.join('\n') + '\n')
          tagger.stdin.end()
        })
      })

      return setTags
    })
  })
}

function copy (source, destination) {
  return new Bluebird((resolve, reject) => {
    pipe(
      createReadStream(source),
      createWriteStream(destination),
      function (err) {
        if (err) return reject(err)

        log.verbose('flac.copy', 'copied', source, 'to', destination)
        resolve()
      }
    )
  })
}

module.exports = { makeAlbum: makeAlbum }
