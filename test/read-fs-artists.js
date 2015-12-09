var join = require('path').join
var writeFileSync = require('graceful-fs').writeFileSync

var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var test = require('tap').test

var readArtists = require('../lib/read-fs-artists.js').readArtists

var basedir = join(__dirname, 'test-read-tree')

function setup () {
  cleanup()
  mkdirp.sync(basedir)
}

function cleanup () {
  rimraf.sync(basedir)
}

test('setup', function (t) {
  setup()
  t.end()
})

test('read empty root', function (t) {
  readArtists(basedir).then(
    function (artists) {
      t.same([...artists], [], 'no artists found in empty directory')
    },
    function (err) {
      t.ifErr(err, "shouldn't crash on empty directory")
    }
  )
  .finally(function () { t. end() })
})

test('read root with one empty artist directory', function (t) {
  setup()
  mkdirp.sync(join(basedir, 'eMPTy'))
  readArtists(basedir).then(
    function (artists) {
      t.same([...artists], [], 'no albums found in empty directory')
    },
    function (err) {
      t.ifErr(err, "shouldn't crash on empty directory")
    }
  )
  .finally(function () { t. end() })
})

test('read root with one empty album directory', function (t) {
  setup()
  mkdirp.sync(join(basedir, 'eMPTy', 'nOTHINg'))
  readArtists(basedir).then(
    function (artists) {
      t.same([...artists], [], 'no tracks found in empty directory')
    },
    function (err) {
      t.ifErr(err, "shouldn't crash on empty directory")
    }
  )
  .finally(function () { t. end() })
})

test('read root with one one-track directory, no cue sheet', function (t) {
  setup()

  var albumDir = join(basedir, 'The Beatles', 'Skiffle Rumble')
  mkdirp.sync(albumDir)
  writeFileSync(join(albumDir, '1-Savage_Beatings_for_All.flac'), 'lol')

  readArtists(basedir).then(
    function (artists) {
      var artist = [...artists][0]
      t.ok(artist, 'found artist')
      t.equal(artist.name, 'The Beatles', "name didn't change")

      var album = artist.albums[0]
      t.ok(album, 'found album')
      t.equal(album.name, 'Skiffle Rumble', "name didn't change")

      t.equal(album.tracks.length, 1, 'found single expected track')
      var track = album.tracks[0]
      t.equal(track.name, 'Savage Beatings for All', 'track name normalized')
      t.equal(track.index, 1, 'track index parsed from filename')
    },
    function (err) {
      t.ifErr(err, "shouldn't crash on empty directory")
    }
  )
  .finally(function () { t. end() })
})

test('read root with one one-track directory, with cue sheet', function (t) {
  setup()

  var artistDir = join(basedir, 'The Beatles')
  mkdirp.sync(artistDir)
  writeFileSync(join(artistDir, 'Skiffle_Rumble.flac'), 'lol')

  var cuesheet = join(artistDir, 'Skiffle_Rumble.cue')
  writeFileSync(cuesheet, 'rofl')

  readArtists(basedir).then(
    function (artists) {
      var artist = [...artists][0]
      t.ok(artist, 'found artist')
      t.equal(artist.name, 'The Beatles', "name didn't change")

      var album = artist.albums[0]
      t.ok(album, 'found album')
      t.equal(album.name, 'Skiffle_Rumble', "name didn't change")

      t.equal(album.cuesheet, cuesheet, 'found cue sheet')
    },
    function (err) {
      t.ifErr(err, "shouldn't crash on empty directory")
    }
  )
  .finally(function () { t. end() })
})

test('cleanup', function (t) {
  cleanup()
  t.end()
})
