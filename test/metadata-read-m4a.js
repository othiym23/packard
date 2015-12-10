var createReadStream = require('graceful-fs').createReadStream
var join = require('path').join
var stat = require('graceful-fs').stat

var test = require('tap').test

var reader = require('../lib/metadata/m4a/reader.js').default

var empty = join(__dirname, 'fixtures', 'empty.m4a')

test('empty track', function (t) {
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
