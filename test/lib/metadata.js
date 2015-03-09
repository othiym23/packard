/*eslint-disable no-undef*/ // oh eslint
var Promise = require('bluebird')
/*eslint-enable no-undef*/
var promisify = Promise.promisify

var path = require('path')
var stat = promisify(require('fs').stat)

var Track = require('../../lib/models/track.js')

var flac = require('./flac.js')

var EMPTY_TRACK = path.resolve(__dirname, '../fixtures/empty.flac')

function makeAlbum (root, date, artistName, albumName, trackNames) {
  return stat(EMPTY_TRACK).then(function (stats) {
    return trackNames.map(function (trackName, index) {
      var track = new Track(
        artistName,
        albumName,
        trackName,
        '-', // path is irrelevant, since we're generating it
        stats
      )
      track.date = date
      track.ext = '.flac'
      track.index = index + 1
      return track
    })
  }).then(function (tracks) {
    return flac.makeAlbum(root, tracks)
  })
}

module.exports = { makeAlbum: makeAlbum }
