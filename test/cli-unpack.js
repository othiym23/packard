var resolve = require('path').resolve
var mkdirp = require('mkdirp')
var nixt = require('nixt')
var rimraf = require('rimraf')
var test = require('tap').test

var p = resolve(__dirname, '../lib/cli.js')

var lines = function () {/*
Options:
  -R, --root     directory root for an Artist/Album tree           [required]  [default: ""]
  -P, --pattern  bash glob pattern used to match files under root
  -s, --staging  where to create the tree for unpacked artists     [required]

Missing required arguments: s
must have a place to put unpacked files
*/}.toString().split('\n').slice(1, -1)

var root = resolve(__dirname, 'blank-tree')

test('setup', function (t) {
  rimraf.sync(root)
  mkdirp(root, function (error) {
    t.ifError(error, 'made blank media directory')
    t.end()
  })
})

test('packard unpack', function (t) {
  var expected = lines.join('\n')
  nixt()
    .env('packard_roots', '')
    .run('node ' + p + ' unpack')
    .expect(function (r) {
      var trimmed = r.stderr
                     .split('\n')
                     .map(function (l) { return l.replace(/\s+$/, '') })
                     .join('\n')
      t.equal(trimmed, expected, '"packard" is missing a required parameter')
    })
    .code(1)
    .end(function (e) {
      t.ifError(e, 'no error on exit')
      t.end()
    })
})

test('cleanup', function (t) {
  rimraf(root, function (error) {
    t.ifError(error, 'made blank media directory')
    t.end()
  })
})
