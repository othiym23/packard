var _ = require('lodash')
var test = require('tap').test

var validateISODate = require('../lib/metadata/validators/iso-date.js').default
var model = require('@packard/model')
var Track = model.Track

test('validator requires a track and warning list', function (t) {
  t.throws(function () {
    validateISODate(null, [])
  })
  t.throws(function () {
    validateISODate(new Track())
  })
  t.end()
})

test('audit track with empty date', function (t) {
  var warnings = []
  validateISODate(new Track(), warnings)
  t.ok(_.includes(warnings, 'is undated'), 'found expected message')
  t.end()
})

test('audit track with weird date', function (t) {
  var warnings = []
  var track = new Track()
  track.date = 'nineteen eighty-five'
  validateISODate(track, warnings)
  t.ok(
    _.includes(warnings, 'has no release year in "nineteen eighty-five"'),
    'found expected message'
  )
  t.end()
})

test('audit track with only year', function (t) {
  var warnings = []
  var track = new Track()
  track.date = '1985'
  validateISODate(track, warnings)
  t.ok(_.includes(warnings, 'has no release month in "1985"'), 'found expected message')
  t.end()
})

test('audit track with year and month but no day', function (t) {
  var warnings = []
  var track = new Track()
  track.date = '1985-07'
  validateISODate(track, warnings)
  t.ok(_.includes(warnings, 'has no release day in "1985-07"'), 'found expected message')
  t.end()
})

test('audit track with full date', function (t) {
  var warnings = []
  var track = new Track()
  track.date = '1985-07-14'
  validateISODate(track, warnings)
  t.same(warnings, [], 'found no warnings')
  t.end()
})
