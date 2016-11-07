var join = require('path').join

var rimrafCB = require('rimraf')
var test = require('tap').test
var Bluebird = require('bluebird')
var rimraf = Bluebird.promisify(rimrafCB)

var scan = require('../lib/metadata/scan.js').default
var transcode = require('../lib/utils/transcode.js').default
var model = require('@packard/model')
var Track = model.Track

var metadata = require('./lib/metadata.js')

var root = join(__dirname, 'utils-transcode')

test('missing track', function (t) {
  t.throws(transcode)
  t.end()
})

test('missing destination', function (t) {
  t.throws(function () { transcode(new Track()) })
  t.end()
})

test('missing encoder', function (t) {
  t.throws(function () { transcode(new Track(), '/tmp') })
  t.end()
})

test('missing encoding profile', function (t) {
  t.throws(function () { transcode(new Track(), '/tmp', 'lame') })
  t.end()
})

test('simple transcoding', function (t) {
  var source = join(root, 'source')
  var destination = join(root, 'destination')

  var makeAlbum = rimraf(root).then(function () {
    return metadata.makeAlbum(
      source,
      '2012-01-20',
      'Gary Beck',
      'Feel It',
      [{ name: 'Feel It' }],
      '.flac',
      'silent'
    )
  })

  var readTrack = makeAlbum.then(function (paths) {
    return scan({ path: paths[0] }, new Map())
  })

  var runTranscode = readTrack.then(function (track) {
    return transcode(track, destination, 'lame', '-V0')
  })

  return runTranscode.then(function (path) {
    console.error('path is', path)
    t.end()
  })
})
