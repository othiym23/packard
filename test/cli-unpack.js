var relative = require('path').relative
var resolve = require('path').resolve

var mkdirp = require('mkdirp')
var nixt = require('nixt')
var rimraf = require('rimraf')
var test = require('tap').test

var p = resolve(__dirname, '../lib/cli.js')
var r = relative(process.cwd(), p)

var lines = function () {/*

Options:
  -s, --staging   where to create the tree for unpacked artists          [required]  [default: ""]
  -R, --root      root directory containing zipped files                 [required]  [default: ""]
  -P, --pattern   bash glob pattern used to match files under root       [default: ""]
  --archive       after other operations, archive original files         [default: false]
  --archive-root  where to archive zip files once they've been unpacked  [default: ""]

must pass either 1 or more zipfiles or root and glob pattern.
*/}.toString().split('\n').slice(1, -1)

var prolog = 'Usage: node ' + r + ' [options] unpack [zipfile [zipfile...]]'

var root = resolve(__dirname, 'blank-tree')

test('setup', function (t) {
  rimraf.sync(root)
  mkdirp(root, function (error) {
    t.ifError(error, 'made blank media directory')
    t.end()
  })
})

test('packard unpack', function (t) {
  var expected = [prolog].concat(lines).join('\n')
  nixt()
    .env('packard_roots', '')
    .env('packard_loglevel', 'info')
    .env('packard_staging-directory', '')
    .env('packard_archive__root', '')
    .env('packard_archive__glob-pattern', '')
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
