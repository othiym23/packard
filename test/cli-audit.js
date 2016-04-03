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
  -h, --help  Show help  [boolean]
  --version   Show version number  [boolean]

must pass either 1 or more files containing metadata
*/ }.toString().split('\n').slice(1, -1)

var prolog = 'Usage: ' + r + ' audit [file [file...]]'

var root = join(__dirname, 'cli-audit')
var flacRoot = join(root, 'flac')
var albumRoot = join(flacRoot, 'Gary Beck', 'Feel It')

test('setup', function (t) {
  rimraf(root).then(function () {
    return mkdirp(root)
  }).then(function () {
    t.end()
  })
})

test('packard audit', function (t) {
  var expected = [prolog].concat(lines).join('\n')
  cli.pnixt()
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

test('packard audit ' + root + '/**/*.flac', function (t) {
  rimraf(root).then(function () {
    return metadata.makeAlbum(
      albumRoot,
      '2011-01-20',
      'Gary Beck / Speedy J',
      'Egoist',
      [
        { artist: 'Gary Beck', name: 'Egoist' },
        { artist: 'Gary Beck feat. Speedy J', name: 'Egoist [Speedy J dub tool]' }
      ]
    )
  }).then(function () {
    return metadata.makeAlbum(
      albumRoot,
      '2015-09',
      'Gary Beck',
      'Scarlett',
      [
        { genre: 'Techno', name: 'Scarlett' },
        { genre: 'Techno', name: 'Gaada Stack' },
        { artist: 'BEK Audio', genre: 'Techno', name: 'Hot Packing Slip' }
      ]
    )
  }).then(function () {
    return glob(root + '/**/*.flac')
  }).then(function (files) {
    cli.pnixt()
      .run('node ' + p + ' audit ' + files.map(function (f) {
        return '"' + f + '"'
      }).join(' '))
      .expect(function (r) {
        t.match(r.stderr, 'Gary Beck - Egoist: has no genre set')
        t.match(r.stderr, 'Speedy J - Egoist [Speedy J dub tool]: has no genre set')
        t.match(r.stderr, 'Gary Beck - Scarlett: has no release day in "2015-09"')
        t.match(r.stderr, 'Gary Beck - Gaada Stack: has no release day in "2015-09"')
        t.match(r.stderr, 'BEK Audio - Hot Packing Slip: has no release day in "2015-09"')
        t.equal(r.stdout, '')
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
