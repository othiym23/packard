var test = require('tap').test

var auditAlbum = require('../lib/metadata/audit.js').default
var auditTrack = require('../lib/metadata/audit.js').auditTrack
var model = require('@packard/model')
var Album = model.MultitrackAlbum
var Artist = model.Artist
var Track = model.Track

test('auditing null track should throw', function (t) {
  t.throws(function () {
    auditTrack(null)
  })
  t.end()
})

test('audit track with no file', function (t) {
  t.doesNotThrow(function () {
    auditTrack(new Track())
  })
  t.end()
})

test('audit track with everything set', function (t) {
  var warnings = auditTrack(
    new Track(
      'A Name',
      new Album('An Album', new Artist('An Artist')),
      new Artist('An Artist'),
      { tags: { genre: 'Dubstep' }, date: '2015-11-27' }
    )
  )
  t.same(warnings, [], 'got no warnings')
  t.end()
})

test('auditing null album should throw', function (t) {
  t.throws(function () {
    auditAlbum(null)
  })
  t.end()
})

test('audit album with no tracks', function (t) {
  t.doesNotThrow(function () {
    auditAlbum(new Album('test', new Artist('test artist')))
  })
  t.end()
})

test('audit album with a warning', function (t) {
  var artist = new Artist('Module Eight')
  var track1 = new Track(
    'Monotype',
    null,
    artist,
    {
      date: '2015-11',
      index: 1,
      tags: { genre: "Drum'n'Bass" }
    }
  )
  var album = new Album('Legacy', artist, { tracks: [track1] })

  var warnings = auditAlbum(album)
  t.equal(warnings.length, 1, 'one warning')
  t.equal(warnings[0], 'Module Eight - Monotype: has no release day in "2015-11"')
  t.end()
})

test('audit album with everything set', function (t) {
  var artist = new Artist('Module Eight')
  var track1 = new Track(
    'Monotype',
    null,
    artist,
    {
      date: '2015-11-03',
      index: 1,
      tags: { genre: "Drum'n'Bass" }
    }
  )
  var track2 = new Track(
    'False Positive',
    null,
    artist,
    {
      date: '2015-11-03',
      index: 2,
      tags: { genre: "Drum'n'Bass" }
    }
  )
  var album = new Album('Legacy', artist, { tracks: [track1, track2] })

  var warnings = auditAlbum(album)
  t.same(warnings, [], 'no warnings')
  t.end()
})
