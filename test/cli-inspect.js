var relative = require('path').relative
var join = require('path').join

var Bluebird = require('bluebird')
var promisify = Bluebird.promisify
var glob = promisify(require('glob'))
var mkdirp = promisify(require('mkdirp'))
var rimraf = promisify(require('rimraf'))

var test = require('tap').test

var cli = require('./lib/cli.js')
var metadata = require('./lib/metadata.js')

var p = join(__dirname, '../lib/cli.js')
var r = relative(process.cwd(), p)

var lines = function () { /*

Options:
  -S, --save-config  save this run's configuration to ~/.packardrc  [boolean] [default: false]
  --loglevel         logging level  [default: "info"]
  -h, --help         Show help  [boolean]
  --version          Show version number  [boolean]

Not enough non-option arguments: got 0, need at least 1
*/ }.toString().split('\n').slice(1, -1)

var prolog = 'Usage: ' + r + ' [options] inspect [file [dir...]]'

var root = join(__dirname, 'blank-tree')
var flacRoot = join(root, 'flac')
var albumRoot = join(flacRoot, 'Gary Beck', 'Feel It')

test('setup', function (t) {
  rimraf(root).then(function () {
    return mkdirp(root)
  }).then(function () {
    t.end()
  })
})

test('packard inspect', function (t) {
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

test('packard inspect ' + root + '"/Gary Beck/[2015] Hentzi/Hentzi.flac"', function (t) {
  rimraf(root).then(function () {
    return metadata.makeAlbum(
      albumRoot,
      '2015',
      'Gary Beck',
      'Hentzi',
      [
        { name: 'Hentzi' },
        { name: 'Wren' },
        { name: 'Leo' },
        { name: 'Karman' }
      ]
    )
  }).then(function () {
    return metadata.makeAlbum(
      albumRoot,
      '2015',
      'Gary Beck',
      'Scarlett',
      [
        { genre: 'Techno', name: 'Scarlett' },
        { genre: 'Techno', name: 'Gaada Stack' },
        { genre: 'Techno', name: 'Hot Packing Slip' }
      ]
    )
  }).then(function () {
    return glob(root + '/**/*.flac')
  }).then(function (files) {
    cli.pnixt()
      .run('node ' + p + ' inspect ' + files.map(function (f) {
        return '"' + f + '"'
      })[0])
      .expect(function (r) {
        t.equal(r.stderr, '')
        t.match(r.stdout, '"date": "2015"')
      })
      .code(0)
      .end(function (e) {
        t.ifError(e, 'no error on exit')
        t.end()
      })
  })
})

test('cleanup', function (t) {
  rimraf(root).then(function () {
    t.end()
  })
})
