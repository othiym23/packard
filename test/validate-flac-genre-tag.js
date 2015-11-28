var _ = require('lodash')
var test = require('tap').test

var validateFLACGenreTag = require('../lib/metadata/validators/flac-genre-tag.js').default
var model = require('@packard/model')
var Track = model.Track

test('validator requires a track and warning list', function (t) {
  t.throws(function () {
    validateFLACGenreTag(null, [])
  })
  t.throws(function () {
    validateFLACGenreTag(new Track())
  })
  t.end()
})

test('audit track with no FLAC tags', function (t) {
  var warnings = []
  validateFLACGenreTag(new Track(), warnings)
  t.ok(_.includes(warnings, 'has no genre set'), 'found expected message')
  t.end()
})

test('audit track with no genre in FLAC tags', function (t) {
  var warnings = []
  var track = new Track()
  track.flacTags = {}
  validateFLACGenreTag(track, warnings)
  t.ok(_.includes(warnings, 'has no genre set'), 'found expected message')
  t.end()
})

test('audit track with unspeakable genre', function (t) {
  var warnings = []
  var track = new Track()
  track.flacTags = { GENRE: '"Alternative"' }
  validateFLACGenreTag(track, warnings)
  t.ok(
    _.includes(warnings, 'has unknown genre "Alternative"'),
    'found expected message'
  )
  t.end()
})

test('audit track with known genre but all caps', function (t) {
  var warnings = []
  var track = new Track()
  track.flacTags = { GENRE: 'TECHNO / HOUSE' }
  validateFLACGenreTag(track, warnings)
  t.ok(
    _.includes(warnings, 'has all-caps genre TECHNO / HOUSE'),
    'found expected message'
  )
  t.end()
})

test('audit track with genre known to be all caps', function (t) {
  var warnings = []
  var track = new Track()
  track.flacTags = { GENRE: 'IDM' }
  validateFLACGenreTag(track, warnings)
  t.same(warnings, [])
  t.end()
})

test('audit track with known genre', function (t) {
  var warnings = []
  var track = new Track()
  track.flacTags = { GENRE: 'UK Garage' }
  validateFLACGenreTag(track, warnings)
  t.same(warnings, [])
  t.end()
})
