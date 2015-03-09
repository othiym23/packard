/*eslint-disable no-undef*/ // oh eslint
var Promise = require('bluebird')
/*eslint-enable no-undef*/
var promisify = Promise.promisify

var createReadStream = require('fs').createReadStream
var createWriteStream = require('fs').createWriteStream
var path = require('path')

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
  return mkdirp(root).then(function () {
    return Promise.resolve(tracks).map(function (track) {
      return new Promise(function (resolve, reject) {
        var processor = new FLACProcessor()
        var source = createReadStream(EMPTY_TRACK)
        track.path = path.join(root, track.safeName())
        var sink = createWriteStream(track.path)

        var comments = [
          'ARTIST=' + track.artist,
          'TITLE=' + track.name,
          'ALBUM=' + track.album,
          'TRACKNUMBER=' + track.index,
          'DATE=' + track.date
        ]

        processor.on('preprocess', function (mdb) {
          if (mdb.type === FLACProcessor.MDB_TYPE_VORBIS_COMMENT) {
            mdb.remove()
            var mdbVorbis = Comment.create(mdb.isLast, VENDOR, comments)
            this.push(mdbVorbis.publish())
          }
        })

        source
          .pipe(processor)
          .pipe(sink)
          .on('error', reject)
          .on('close', function () {
            resolve(track.path)
          })
      })
    }, {concurrency: 1})
  })
}

module.exports = { makeAlbum: makeAlbum }
