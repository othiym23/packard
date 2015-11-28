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

var lines = function () {/*

Options:
  -R, --root  directory root for an Artist/Album tree  [array]

Must pass 1 or more audio files or directory trees.
*/}.toString().split('\n').slice(1, -1)

var prolog = 'Usage: ' + r + ' [options] albums [-R dir [file...]]'

var root = join(__dirname, 'cli-albums')
var flacRoot = join(root, 'flac')
var albumRoot = join(flacRoot, 'Gary Beck', 'Feel It')

test('setup', function (t) {
  rimraf(root).then(function () {
    return mkdirp(root)
  }).then(function () {
    t.end()
  })
})

test('packard artists', function (t) {
  var expected = [prolog].concat(lines).join('\n')
  cli.pnixt()
    .run('node ' + p + ' albums')
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

test('packard artists -R ' + root, function (t) {
  rimraf(root).then(function () {
    return metadata.makeAlbum(
      albumRoot,
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
      albumRoot,
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
      .run('node ' + p + ' albums -R ' + root)
      .expect(function (r) {
        t.equal(r.stderr, '', '"packard albums" ran without errors')
        t.match(r.stdout, 'albums:')
        t.match(r.stdout, /Gary Beck/)
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
