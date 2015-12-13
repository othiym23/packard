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
var m4a = require('./m4a.js')
var mp3 = require('./mp3.js')

var EMPTY_TRACK = path.join(__dirname, '../fixtures/empty.flac')

function makeAlbum (root, date, artistName, albumName, trackTemplates, ext) {
  if (!ext) ext = '.flac'

  return stat(EMPTY_TRACK).then(function (stats) {
    var artist = new Artist(artistName)
    var album = new Album(albumName, artist)
    var prepared = trackTemplates.map(function (template, index) {
      var trackArtist = template.artist ? new Artist(template.artist) : artist
      var track = new Track(
        template.name || '[untitled]',
        album,
        trackArtist,
        {
          path: EMPTY_TRACK,
          stats: stats,
          ext: ext,
          index: index + 1,
          date: date
        }
      )
      if (template.genre) track.tags = { genre: template.genre }
      track.file.path = path.join(root, template.path || track.safeName())

      return track
    })

    if (ext === '.flac') return flac.makeAlbum(root, prepared)
    else if (ext === '.m4a') return m4a.makeAlbum(root, prepared)
    else if (ext === '.mp3') return mp3.makeAlbum(root, prepared)
    else throw new TypeError("Can't create album for " + ext)
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
