var relative = require('path').relative
var join = require('path').join

var Bluebird = require('bluebird')
var promisify = Bluebird.promisify
var mkdirp = promisify(require('mkdirp'))
var rimraf = promisify(require('rimraf'))

var test = require('tap').test

var cli = require('./lib/cli.js')
var metadata = require('./lib/metadata.js')

var p = join(__dirname, '../lib/cli.js')
var r = relative(process.cwd(), p)

var lines = function () { /*

Options:
  -S, --save-config       save this run's configuration to ~/.packardrc  [boolean] [default: false]
  --loglevel              logging level  [default: "info"]
  -h, --help              Show help  [boolean]
  --version               Show version number  [boolean]
  -B, --block-size        size of blocks on target volume  [default: 512]
  -O, --optimal-capacity  size of target volume, in blocks  [required]
  -R, --root              directory root for an Artist/Album tree  [array]

Missing required argument: O
- Must have a target to optimize towards.
*/ }.toString().split('\n').slice(1, -1)

var prolog = 'Usage: ' + r + ' [options] optimize -O blocks [-R dir [file...]]'

var root = join(__dirname, 'cli-optimize')
var flacRoot = join(root, 'flac')
var albumRoot = join(flacRoot, 'Gary Beck')

test('setup', function (t) {
  rimraf(root).then(function () {
    return mkdirp(root)
  }).then(function () {
    t.end()
  })
})

test('packard optimize', function (t) {
  var expected = [prolog].concat(lines).join('\n')
  cli.pnixt()
    .run('node ' + p + ' optimize')
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

test('packard optimize -O 190 -R ' + root, function (t) {
  rimraf(root).then(function () {
    return metadata.makeAlbum(
      join(albumRoot, 'Algoreal 12 inch mix  Naptha'),
      '2012',
      'Gary Beck',
      'Algoreal 12 inch mix / Naptha',
      [
        { name: 'Algoreal [12" mix"]' },
        { name: 'Naptha' }
      ]
    )
  }).then(function () {
    return metadata.makeAlbum(
      join(albumRoot, 'Bring a Friend'),
      '2012',
      'Gary Beck',
      'Bring a Friend',
      [
        { name: 'I Read About You' },
        { name: 'Algoreal' },
        { name: 'D51' },
        { name: 'Before the Crash' },
        { name: 'Unaware' },
        { name: 'Skiver' },
        { name: 'Hopkin' },
        { name: 'Little Moon' },
        { name: 'Bring a Friend' },
        { name: 'Operation' }
      ]
    )
  }).then(function () {
    cli.pnixt()
      .run('node ' + p + ' optimize -O 190 -R "' + root + '"')
      .expect(function (r) {
        t.equal(r.stderr, '', '"packard optimize" ran without errors')
        t.match(r.stdout, /included:[\s\S]+TOTAL: \d+ .+ \(of 190 block capacity\)[\s\S]+left out:/gm)
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
