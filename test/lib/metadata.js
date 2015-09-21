var Promise = require('bluebird')
var promisify = Promise.promisify

var path = require('path')
var stat = promisify(require('fs').stat)

var model = require('@packard/model')
var Artist = model.Artist
var Album = model.MultitrackAlbum
var Track = model.Track

var flac = require('./flac.js')

var EMPTY_TRACK = path.join(__dirname, '../fixtures/empty.flac')

function makeAlbum (root, date, artistName, albumName, trackTemplates) {
  const artist = new Artist(artistName)
  const album = new Album(albumName, artist)
  return stat(EMPTY_TRACK).then(function (stats) {
    return flac.makeAlbum(root, trackTemplates.map(function (template, index) {
      var track = new Track(
        template.name || '[untitled]',
        album,
        artist,
        {
          path: EMPTY_TRACK,
          stats: stats,
          ext: '.flac',
          index: index + 1,
          date: date
        }
      )
      track.file.path = path.join(root, template.path || track.safeName())

      return track
    }))
  })
}

module.exports = { makeAlbum: makeAlbum }
