require('babel/polyfill')

var inspect = require('util').inspect

var test = require('tap').test

var albumsFromTracks = require('../lib/flac/albums-from-tracks.js')

var Album = require('../lib/models/album-multi.js')
var Archive = require('../lib/models/archive.js')
var Artist = require('../lib/models/artist.js')
var AudioFile = require('../lib/models/audio-file.js')
var Track = require('../lib/models/track.js')

function makeTrack () {
  var sourceArchive = new Archive('/test/source.zip', { fakeStats: true })
  var audioFile = new AudioFile('/test/file.flac', { fakeStats: true })
  var fsArtist = new Artist('fartist')
  var fsAlbum = new Album('falbum', fsArtist, '/album/path')
  var flacTags = {
    ARTIST: 'FARTIST',
    ALBUMARTIST: 'FaRtIsT',
    ALBUM: 'FALBUM'
  }
  var extras = {
    fsArtist: fsArtist,
    fsAlbum: fsAlbum,
    sourceArchive: sourceArchive,
    file: audioFile,
    flacTags: flacTags,
    date: '2007-08-28'
  }
  var artist = new Artist('Fartist')
  var album = new Album('Falbum', artist)
  return new Track(artist, album, 'Fame', extras)
}

function idealAlbum () {
  var sourceArchive = new Archive('/test/source.zip', { fakeStats: true })
  var audioFile = new AudioFile('/test/file.flac', { fakeStats: true })

  var fsArtist = new Artist('fartist')
  var fsAlbum = new Album('falbum', fsArtist, '/album/path')

  var flacTags = {
    ARTIST: 'FARTIST',
    ALBUMARTIST: 'FaRtIsT',
    ALBUM: 'FALBUM'
  }

  var extras = {
    fsArtist: fsArtist,
    fsAlbum: fsAlbum,
    sourceArchive: sourceArchive,
    file: audioFile,
    flacTags: flacTags,
    date: '2007-08-28'
  }

  var artist = new Artist('FaRtIsT')
  var album = new Album('FALBUM', artist, '/test')
  album.date = '2007-08-28'
  album.sourceArchive = sourceArchive
  album.tracks.push(new Track(new Artist('Fartist'), album, 'Fame', extras))

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
      t.equal(inspect(out), inspect(ideal), 'basic metadata is equal')
      t.equal(inspect(out.tracks[0]), inspect(ideal.tracks[0]), 'track metadata is equal')
    },
    'albumsFromTracks does not error when given an array with one track'
  )
  t.end()
})
