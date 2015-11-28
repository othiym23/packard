var relative = require('path').relative
var resolve = require('path').resolve

var mkdirp = require('mkdirp')
var nixt = require('nixt')
var rimraf = require('rimraf')
var test = require('tap').test

var p = resolve(__dirname, '../lib/cli.js')
var r = relative(process.cwd(), p)

var lines = function () {/*

must pass either 1 or more files containing metadata
*/}.toString().split('\n').slice(1, -1)

var prolog = 'Usage: ' + r + ' audit [file [file...]]'

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
  nixt()
    .env('packard_roots', '')
    .env('packard_loglevel', 'info')
    .env('packard_staging-directory', '')
    .env('packard_archive__root', '')
    .env('packard_archive__enabled-by-default', '')
    .env('packard_archive__glob-pattern', '')
    .env('packard_playlist', '')
    .run('node ' + p + ' audit')
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
