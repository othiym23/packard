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
  -S, --save-config   save this run's configuration to ~/.packardrc
                                                      [boolean] [default: false]
  --loglevel          logging level                            [default: "info"]
  -h, --help          Show help                                        [boolean]
  --version           Show version number                              [boolean]
  -B, --block-size    size of blocks on target volume             [default: 512]
  -R, --from          where to move tracks and albums from               [array]
  -s, --to            root relative to which to start packing         [required]
  -T, --transcode     transcode FLACs to MP3
  --mp3-encoder       preferred MP3 encoder                    [default: "lame"]
  --encoding-profile  preset to use for encoding settings       [default: "-V0"]

Missing required argument: s
- Must have a root to move files to.
*/ }.toString().split('\n').slice(1, -1)

var prolog = 'Usage: ' + r + ' [options] pack --to dest --from src [-R dir [file...]]'

var root = join(__dirname, 'cli-pack')
var from = join(root, 'flac')
var artistRoot = join(from, 'Gary Beck')
var to = join(root, 'target')

test('setup', function (t) {
  return rimraf(root).then(function () { return mkdirp(root) })
})

test('packard pack', function (t) {
  var expected = [prolog].concat(lines).join('\n')
  cli.pnixt()
    .run('node ' + p + ' pack')
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

test('packard pack --to ' + to + ' --from ' + from, function (t) {
  return rimraf(root).then(function () {
    return metadata.makeAlbum(
      join(artistRoot, 'Algoreal 12 inch mix  Naptha'),
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
      join(artistRoot, 'Bring a Friend'),
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
    return new Bluebird(function (resolve, reject) {
      cli.pnixt()
        .run('node ' + p + ' pack --to "' + to + '" --from "' + from + '"')
        .expect(function (r) {
          t.equal(r.stderr, '', '"packard pack" ran without errors')
          t.match(r.stdout, /^packed:/gm)
          t.match(
            r.stdout,
            /target\/flac\/Gary Beck\/\[2012] Algoreal 12 inch mix {2}Naptha \{6 blocks\}/gm
          )
          t.match(
            r.stdout,
            /target\/flac\/Gary Beck\/\[2012] Bring a Friend \{30 blocks\}/gm
          )
          t.match(r.stdout, /\d+ \d+-byte blocks used on device, \d+ remaining$/gm)
        })
        .code(0)
        .end(function (e) {
          if (e) return reject(e)
          resolve()
        })
    })
  })
})

test('cleanup', function (t) { return rimraf(root) })
