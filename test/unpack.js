/* eslint-disable no-undef */ // oh eslint
var Promise = require('bluebird')
/* eslint-enable no-undef */
var promisify = Promise.promisify

var join = require('path').join

var rimraf = promisify(require('rimraf'))
var test = require('tap').test

var unpack = require('../lib/unpack.js')

var metadata = require('./lib/metadata.js')
var zip = require('./lib/zip.js')

var root = join(__dirname, 'single-artist-unpack')

test('unpacking a single-artist album', function (t) {
  var staging = join(root, 'staging', 'flac')
  // var archive = join(root, 'archive')
  var flacRoot = join(root, 'flac')
  var albumRoot = join(flacRoot, 'Gary Beck', 'Feel It')

  rimraf(root).then(function () {
    return metadata.makeAlbum(
      albumRoot,
      '2012-01-20',
      'Gary Beck',
      'Feel It',
      [
        'Feel It',
        'Paid Out',
        'Hillview'
      ]
    )
  }).then(function (paths) {
    t.equal(paths.length, 3, 'all three FLAC files written')
    return zip.pack(join(root, 'Feel It.zip'), paths)
  }).then(function (zipfile) {
    return unpack([zipfile], staging)
             .catch(function (e) {
               t.ifError(e, 'unpacking zipfile succeeded')
             })
  }).then(function (albums) {
    t.equal(albums.size, 1, 'got 1 album back')
    var album = albums.values().next().value
    t.ok(album, 'found album OK')
    t.equal(album.artist, 'Gary Beck', 'got correct artist name')
    t.equal(album.name, 'Feel It', 'got correct album name')
    t.equal(album.tracks.length, 3, 'album has its tracks')
  }).catch(function (e) {
    t.ifError(e, 'creating album succeeded')
  }).finally(function () {
    t.end()
  })
})

test('cleanup', function (t) {
  rimraf(root).then(function () { t.end() })
})
