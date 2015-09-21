var Bluebird = require('bluebird')
var promisify = Bluebird.promisify

var log = require('npmlog')
var mkdirp = promisify(require('mkdirp'))
var path = require('path')
var stat = promisify(require('graceful-fs').stat)
var writeFile = promisify(require('graceful-fs').writeFile)

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

function makeStubFiles (root, oldPaths, newPaths) {
  return Bluebird.map(newPaths, function (stub) {
    var container = path.join(root, path.dirname(stub))
    var target = path.join(root, stub)
    log.silly('makeStubFiles', 'container', container)
    return mkdirp(container).then(function () {
      log.silly('makeStubFiles', 'writing', target)
      return writeFile(path.join(root, stub), 'xoxo bb')
    }).then(function () {
      return target
    })
  }).then(function (paths) { return oldPaths.concat(paths) })
}

module.exports = { makeAlbum: makeAlbum, makeStubFiles: makeStubFiles }
