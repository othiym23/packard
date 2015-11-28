var relative = require('path').relative
var resolve = require('path').resolve

var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var test = require('tap').test

var cli = require('./lib/cli.js')

var p = resolve(__dirname, '../lib/cli.js')
var r = relative(process.cwd(), p)

var lines = function () {/*

Not enough non-option arguments: got 1, need at least 2
*/}.toString().split('\n').slice(1, -1)

var prolog = 'Usage: ' + r + ' [options] inspect [file [dir...]]'

var root = resolve(__dirname, 'blank-tree')

test('setup', function (t) {
  rimraf.sync(root)
  mkdirp(root, function (error) {
    t.ifError(error, 'made blank media directory')
    t.end()
  })
})

test('packard audit', function (t) {
  var expected = [prolog].concat(lines).join('\n')
  cli.pnixt()
    .run('node ' + p + ' inspect')
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
