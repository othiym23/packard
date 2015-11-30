require('babel-polyfill')

var test = require('tap').test

var albumsFromTracks = require('../lib/metadata/albums-from-tracks.js').default

var model = require('@packard/model')
var Album = model.MultitrackAlbum
var Archive = model.Archive
var Artist = model.Artist
var AudioFile = model.AudioFile
var Track = model.Track

function makeTrack () {
  var sourceArchive = new Archive('/test/source.zip', { fakeStats: true })
  var audioFile = new AudioFile('/test/file.flac', { fakeStats: true })
  var fsArtist = new Artist('fartist')
  var fsAlbum = new Album('falbum', fsArtist, { path: '/album/path' })
  var tags = {
    artist: 'FARTIST',
    albumArtist: 'FaRtIsT',
    album: 'FALBUM'
  }
  var extras = {
    fsArtist: fsArtist,
    fsAlbum: fsAlbum,
    sourceArchive: sourceArchive,
    file: audioFile,
    tags: tags,
    date: '2007-08-28'
  }
  var artist = new Artist('Fartist')
  var album = new Album('Falbum', artist)
  return new Track('Fame', album, artist, extras)
}

function idealAlbum () {
  var sourceArchive = new Archive('/test/source.zip', { fakeStats: true })
  var audioFile = new AudioFile('/test/file.flac', { fakeStats: true })

  var fsArtist = new Artist('fartist')
  var fsAlbum = new Album('falbum', fsArtist, { path: '/album/path' })

  var tags = {
    artist: 'FARTIST',
    albumArtist: 'FaRtIsT',
    album: 'FALBUM'
  }

  var extras = {
    fsArtist: fsArtist,
    fsAlbum: fsAlbum,
    sourceArchive: sourceArchive,
    file: audioFile,
    tags: tags,
    date: '2007-08-28'
  }

  var artist = new Artist('Fartist')
  var album = new Album('Falbum', artist, { path: '/test' })
  album.date = '2007-08-28'
  album.sourceArchive = sourceArchive
  album.tracks = [new Track('Fame', album, new Artist('Fartist'), extras)]

  return album
}

test('basic albumsFromTracks', function (t) {
  t.throws(
    function () { albumsFromTracks() },
    { name: 'AssertionError', message: 'must pass metadata' },
    'albumsFromTracks requires an array of arrays of tracks'
  )

  t.doesNotThrow(
    function () {
      t.equal(albumsFromTracks([]).size, 0, 'got out what we put in')
    },
    'albumsFromTracks does not error when given an array'
  )

  t.doesNotThrow(
    function () {
      t.equal(albumsFromTracks(new Set()).size, 0, 'got out what we put in')
    },
    'albumsFromTracks does not error when given a Set'
  )

  t.doesNotThrow(
    function () {
      t.equal(albumsFromTracks(new Map().values()).size, 0, 'got out what we put in')
    },
    'albumsFromTracks does not error when given an iterator'
  )

  t.doesNotThrow(
    function () {
      var out = albumsFromTracks([makeTrack()]).values().next().value
      var ideal = idealAlbum()
      t.same(out, ideal, 'basic metadata is equal')
      t.same(out.tracks[0], ideal.tracks[0], 'track metadata is equal')
    },
    'albumsFromTracks does not error when given an array with one track'
  )
  t.end()
})
