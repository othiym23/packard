var Promise = require('bluebird')
var promisify = Promise.promisify

var path = require('path')
var stat = promisify(require('fs').stat)

var Artist = require('../../lib/models/artist.js')
var Album = require('../../lib/models/album-multi.js')
var Track = require('../../lib/models/track.js')

var flac = require('./flac.js')

var EMPTY_TRACK = path.resolve(__dirname, '../fixtures/empty.flac')

function makeAlbum (root, date, artistName, albumName, trackNames) {
  const artist = new Artist(artistName)
  const album = new Album(albumName, artist)
  return stat(EMPTY_TRACK).then(function (stats) {
    return flac.makeAlbum(root, trackNames.map(function (trackName, index) {
      var track = new Track(
        artist,
        album,
        trackName,
        {
          path: EMPTY_TRACK, // path is irrelevant, since we're generating it
          stats: stats,
          ext: '.flac'
        }
      )
      track.date = date
      track.index = index + 1
      return track
    }))
  })
}

module.exports = { makeAlbum: makeAlbum }
