var join = require('path').join
var relative = require('path').relative

var Bluebird = require('bluebird')
var promisify = Bluebird.promisify
var mkdirp = promisify(require('mkdirp'))
var rimraf = promisify(require('rimraf'))

var test = require('tap').test

var cli = require('./lib/cli.js')
var metadata = require('./lib/metadata.js')
var zip = require('./lib/zip.js')

var p = join(__dirname, '../lib/cli.js')
var r = relative(process.cwd(), p)

var lines = function () { /*

Options:
  -S, --save-config  save this run's configuration to ~/.packardrc  [boolean] [default: false]
  --loglevel         logging level  [default: "info"]
  -h, --help         Show help  [boolean]
  --version          Show version number  [boolean]
  -R, --root         root directory containing zipped files  [array]
  -P, --pattern      bash glob pattern used to match files under root
  -s, --staging      where to create the tree for unpacked artists  [required]
  --archive          after other operations, archive original files  [boolean]
  --archive-root     where to archive zip files once they've been unpacked
  --playlist         create a playlist containing all of the unpacked albums  [string]

Missing required argument: s
- Must have a place to put unpacked files.
*/ }.toString().split('\n').slice(1, -1)

var prolog = 'Usage: ' + r + ' [options] unpack [zipfile [zipfile...]]'

var root = join(__dirname, 'cli-unpack')
var staging = join(root, 'staging', 'flac')
var flacRoot = join(root, 'flac')
var albumRoot = join(flacRoot, 'Gary Beck', 'Feel It')

test('setup', function (t) {
  rimraf(root).then(function () {
    return mkdirp(root)
  }).then(function () {
    t.end()
  })
})

test('packard unpack', function (t) {
  var expected = [prolog].concat(lines).join('\n')
  cli.pnixt()
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

test('packard unpack file.zip', function (t) {
  rimraf(root).then(function () {
    return metadata.makeAlbum(
      albumRoot,
      '2012-01-20',
      'Gary Beck',
      'Feel It',
      [
        { name: 'Feel It' },
        { name: 'Paid Out' },
        { name: 'Hillview' }
      ]
    )
  }).then(function (paths) {
    t.equal(paths.length, 3, 'all three FLAC files written')
    return zip.pack(join(root, 'Feel It.zip'), paths)
  }).then(function (zipfile) {
    cli.pnixt()
      .run('node ' + p + ' unpack "' + zipfile + '" -s ' + staging)
      .expect(function (r) {
        t.equal(r.stderr, '', '"packard unpack" ran without errors')
        t.match(r.stdout, /\(unpacked to.*flac\/Gary Beck\/Feel It\)/)
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
