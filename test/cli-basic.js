var resolve = require('path').resolve
var relative = require('path').relative

var mkdirp = require('mkdirp')
var nixt = require('nixt')
var rimraf = require('rimraf')
var test = require('tap').test

var p = resolve(__dirname, '../lib/cli.js')
var r = relative(process.cwd(), p)

var lines = function () {/*

Commands:
  artists    generate a list of artists from roots
  unpack     unpack a set of files into a staging directory

Options:
  -h, --help  Show help
  --loglevel  logging level        [default: "info"]
  --version   Show version number

Not enough non-option arguments: got 0, need at least 1
*/}.toString().split('\n').slice(1, -1)

var prolog = 'Usage: node ' + r + ' [options] <command>'

var root = resolve(__dirname, 'blank-tree')

test('setup', function (t) {
  rimraf.sync(root)
  mkdirp(root, function (error) {
    t.ifError(error, 'made blank media directory')
    t.end()
  })
})

test('packard', function (t) {
  var expected = [prolog].concat(lines).join('\n')
  nixt()
    .run('node ' + p)
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

test('packard unknown', function (t) {
  var unknown = [prolog].concat(lines.slice(0, -1)).join('\n')
  nixt()
    .run('node ' + p + ' unknown')
    .expect(function (r) {
      var trimmed = r.stderr
                     .split('\n')
                     .map(function (l) { return l.replace(/\s+$/, '') })
                     .join('\n')
      t.equal(trimmed, unknown, '"packard unknown" doesn\t have any missing parameters')
    })
    .code(1)
    .end(function (e) {
      t.ifError(e, 'got expected default output')
      t.end()
    })
})

test('packard --version', function (t) {
  nixt()
    .run('node ' + p + ' --version')
    .stdout(require('../package.json').version)
    .code(0)
    .end(function (e) {
      t.ifError(e, 'got expected default output')
      t.end()
    })
})

test('packard artists', function (t) {
  nixt()
    .run('node ' + p + ' artists -R ' + root)
    .stdout('')
    .stderr('')
    .code(0)
    .end(function (e) {
      t.ifError(e, 'got expected default output')
      t.end()
    })
})

test('cleanup', function (t) {
  rimraf(root, function (error) {
    t.ifError(error, 'made blank media directory')
    t.end()
  })
})
