require('es6-shim')

var inspect = require('util').inspect

var test = require('tap').test

var albumsFromMetadata = require('../lib/metadata/flac.js').albumsFromMetadata

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

test('basic albumsFromMetadata', function (t) {
  t.throws(
    function () { albumsFromMetadata() },
    { name: 'AssertionError', message: 'must pass metadata' },
    'albumsFromMetadata requires an array of arrays of tracks'
  )

  t.doesNotThrow(
    function () {
      t.same(albumsFromMetadata([]), [], 'got out what we put in')
    },
    'albumsFromMetadata does not error when given an array'
  )

  t.doesNotThrow(
    function () {
      t.same(albumsFromMetadata(new Set()), [], 'got out what we put in')
    },
    'albumsFromMetadata does not error when given a Set'
  )

  t.doesNotThrow(
    function () {
      t.same(albumsFromMetadata(new Map().values()), [], 'got out what we put in')
    },
    'albumsFromMetadata does not error when given an iterator'
  )

  t.doesNotThrow(
    function () {
      var out = albumsFromMetadata([makeTrack()]).values().next().value
      var ideal = idealAlbum()
      t.equal(inspect(out), inspect(ideal), 'basic metadata is equal')
      t.equal(inspect(out.tracks[0]), inspect(ideal.tracks[0]), 'track metadata is equal')
    },
    'albumsFromMetadata does not error when given an array with one track'
  )
  t.end()
})
