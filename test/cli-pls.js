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
  -S, --save-config  save this run's configuration to ~/.packardrc
                                                      [boolean] [default: false]
  --loglevel         logging level                             [default: "info"]
  -h, --help         Show help                                         [boolean]
  --version          Show version number                               [boolean]
  -R, --root         directory root for an Artist/Album tree  [array] [required]

Missing required argument: R
- Must have at least one tree to scan.
*/ }.toString().split('\n').slice(1, -1)

var prolog = 'Usage: ' + r + ' [options] pls [-R dir [-R dir...]]'

var root = join(__dirname, 'cli-pls')
var flacRoot = join(root, 'flac')
var albumRoot = join(flacRoot, 'Gary Beck', 'Feel It')

test('setup', function (t) {
  rimraf(root).then(function () {
    return mkdirp(root)
  }).then(function () {
    t.end()
  })
})

test('packard pls', function (t) {
  var expected = [prolog].concat(lines).join('\n')
  cli.pnixt()
    .run('node ' + p + ' pls')
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

test('packard pls ' + root + '/**/*.flac', function (t) {
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
  }).then(function () {
    cli.pnixt()
      .run('node ' + p + ' pls -R ' + root)
      .expect(function (r) {
        t.match(r.stderr, 'created playlist with 3 tracks')
        t.match(r.stdout, '[playlist]')
        t.match(r.stdout, 'Title1=Feel It')
        t.match(r.stdout, 'Title2=Paid Out')
        t.match(r.stdout, 'Title3=Hillview')
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
