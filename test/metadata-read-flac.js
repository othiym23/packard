var createReadStream = require('graceful-fs').createReadStream
var join = require('path').join
var stat = require('graceful-fs').stat

var Bluebird = require('bluebird')
var test = require('tap').test

var promisify = Bluebird.promisify
var rimraf = promisify(require('rimraf'))

var reader = require('../lib/metadata/flac/reader.js').default

var metadata = require('./lib/metadata.js')

var root = join(__dirname, 'metadata-read-flac')

test('empty track', function (t) {
  var empty = join(__dirname, 'fixtures', 'empty.flac')
  stat(empty, function (er, stats) {
    if (er) throw er

    createReadStream(empty).pipe(reader(
      { path: empty, stats: stats },
      new Map(),
      function (info) {
        var track = info.track
        t.ok(track, 'should get back a track')
        t.equal(track.file.path, empty)
        t.end()
      },
      function (er) {
        t.ifError(er, 'shouldn\'t have failed to read')
        t.end()
      }
    ))
  })
})

test('single-track album with metadata', function (t) {
  var flacRoot = join(root, 'flac')
  var albumRoot = join(flacRoot, 'The Necks', 'Open')
  var makeAlbum = rimraf(root).then(function () {
    return metadata.makeAlbum(
      albumRoot,
      '2012-01-20',
      'The Necks',
      'Open',
      [{ name: 'Open' }],
      '.flac'
    )
  })

  makeAlbum.then(function (paths) {
    t.equal(paths.length, 1)
    stat(paths[0], function (er, stats) {
      if (er) throw er
      createReadStream(paths[0]).pipe(reader(
        { path: paths[0], stats: stats },
        new Map(),
        function (info) {
          var track = info.track
          t.ok(track, 'should get back a track')
          t.equal(track.file.path, paths[0])
          t.equal(track.tags.artist, 'The Necks')
          t.equal(track.tags.album, 'Open')
          t.equal(track.tags.title, 'Open')
          t.equal(track.date, '2012-01-20')
          t.equal(track.index, 1)
          t.end()
        },
        function (er) {
          t.ifError(er, 'shouldn\'t have failed to read')
          t.end()
        }
      ))
    })
  })
})

test('cleanup', function () { return rimraf(root) })
