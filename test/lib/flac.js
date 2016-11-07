var createReadStream = require('fs').createReadStream
var createWriteStream = require('fs').createWriteStream
var dirname = require('path').dirname
var resolve = require('path').resolve

var log = require('npmlog')
var moment = require('moment')
var Bluebird = require('bluebird')
var FLACProcessor = require('flac-metadata').Processor
var VorbisComment = require('flac-metadata').data.MetaDataBlockVorbisComment

var promisify = Bluebird.promisify
var mkdirp = promisify(require('mkdirp'))

var version = require('../../package.json').version
var nowish = moment().format('YYYYMMDD')

var VENDOR = 'testing packard ' + version + ' ' + nowish

function makeAlbum (root, tracks, sourceFile) {
  if (!sourceFile) sourceFile = resolve(__dirname, '../fixtures/empty.flac')
  // FLACProcessor has internal state confused by concurrency
  return Bluebird.mapSeries(tracks, function (track) {
    return mkdirp(dirname(track.file.path)).then(function () {
      return new Bluebird(function (resolve, reject) {
        var source = createReadStream(sourceFile)
        var processor = new FLACProcessor()
        var sink = createWriteStream(track.file.path)

        processor.on('preprocess', function (mdb) {
          if (mdb.type === FLACProcessor.MDB_TYPE_VORBIS_COMMENT) {
            log.silly('makeAlbum.preprocess', track.file.path, 'removing existing tags')
            mdb.remove()
          } else if (mdb.removed || mdb.isLast) {
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

            var mdbVorbis = VorbisComment.create(mdb.isLast, VENDOR, tags)
            log.silly('makeAlbum.preprocess', track.file.path, 'created', mdbVorbis)
            this.push(mdbVorbis.publish())
          }
        })

        source
          .pipe(processor)
          .on('error', reject)
          .pipe(sink)
          .on('error', reject)
          .on('finish', function () { resolve(track.file.path) })
      })
    })
  })
}

module.exports = { makeAlbum: makeAlbum }
