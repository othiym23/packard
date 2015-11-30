var Bluebird = require('bluebird')
var promisify = Bluebird.promisify

var createReadStream = require('fs').createReadStream
var createWriteStream = require('fs').createWriteStream
var path = require('path')

var log = require('npmlog')
var md = require('flac-metadata')
var mkdirp = promisify(require('mkdirp'))
var moment = require('moment')
var Comment = md.data.MetaDataBlockVorbisComment
var FLACProcessor = md.Processor

var version = require('../../package.json').version
var nowish = moment().format('YYYYMMDD')

var VENDOR = 'testing packard ' + version + ' ' + nowish
var EMPTY_TRACK = path.resolve(__dirname, '../fixtures/empty.flac')

function makeAlbum (root, tracks) {
  return Bluebird.map(tracks, function (track) {
    return mkdirp(path.dirname(track.file.path)).then(function () {
      return new Bluebird(function (resolve, reject) {
        var processor = new FLACProcessor()
        var source = createReadStream(EMPTY_TRACK)
        var sink = createWriteStream(track.file.path)

        var mdbVorbis
        processor.on('preprocess', function (mdb) {
          if (mdb.type === FLACProcessor.MDB_TYPE_VORBIS_COMMENT) {
            log.silly('makeAlbum.preprocess', track.file.path, 'removing existing tags')
            mdb.remove()
          }

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

          if (mdb.isLast) {
            mdb.isLast = false
            mdbVorbis = Comment.create(
              true,
              VENDOR,
              tags
            )
            log.silly('makeAlbum.preprocess', track.file.path, 'created', mdbVorbis)
          }
        })

        processor.on('postprocess', function () {
          if (mdbVorbis) {
            log.silly('makeAlbum.postprocess', track.file.path, 'publishing tags')
            this.push(mdbVorbis.publish())
          }
        })

        source
          .pipe(processor)
          .pipe(sink)
          .on('error', reject)
          .on('close', function () {
            resolve(track.file.path)
          })
      })
    })
  }, { concurrency: 1 }) // FLAC writer gets confused without this
}

module.exports = { makeAlbum: makeAlbum }
