var join = require('path').join
var spawn = require('child_process').spawn

var concat = require('mississippi').concat
var log = require('npmlog')
var pipe = require('mississippi').pipe
var test = require('tap').test
var Bluebird = require('bluebird')

var rimraf = Bluebird.promisify(require('rimraf'))
var which = Bluebird.promisify(require('which'))

var scan = require('../lib/metadata/scan.js').default
var transcode = require('../lib/utils/transcode.js').default
var model = require('@packard/model')
var Track = model.Track

var metadata = require('./lib/metadata.js')

var root = join(__dirname, 'utils-transcode')

test('missing track', function (t) {
  t.throws(transcode)
  t.end()
})

test('missing destination', function (t) {
  t.throws(function () { transcode(new Track()) })
  t.end()
})

test('missing encoder', function (t) {
  t.throws(function () { transcode(new Track(), '/tmp') })
  t.end()
})

test('missing encoding profile', function (t) {
  t.throws(function () { transcode(new Track(), '/tmp', 'lame') })
  t.end()
})

test('simple transcoding', function (t) {
  var source = join(root, 'source')
  var destination = join(root, 'destination')

  var makeAlbum = rimraf(root).then(function () {
    return metadata.makeAlbum(
      source,
      '2012-01-20',
      'Gary Beck',
      'Feel It',
      [{ name: 'Feel It' }],
      '.flac',
      'silent'
    )
  })

  var readTrack = makeAlbum.then(function (paths) {
    log.silly('simpleTest', 'encoded', paths)
    return scan({ path: paths[0] }, new Map())
  })

  var runTranscode = readTrack.then(function (track) {
    return transcode(track, destination, 'lame', '-V0')
  })

  return runTranscode.then(function (path) {
    var ensureMp3val = which('mp3val')

    return ensureMp3val.then(function (mp3val) {
      return new Bluebird(function (resolve, reject) {
        var verifier = spawn(
          mp3val,
          [ path ],
          {}
        )

        pipe(verifier.stdout, concat({ encoding: 'string' }, function (output) {
          t.notMatch(output, /WARNING/m, 'no warnings from mp3val')
          t.match(
            output,
            /INFO.+166 MPEG frames \(MPEG 1 Layer III\), \+ID3v2, Xing header/m,
            'found expected stream content'
          )
        }))

        pipe(verifier.stderr, concat({ encoding: 'string' }, function (output) {
          t.notOk(output, 'no error output from mp3val')
        }))

        verifier.on('error', reject)
        verifier.on('close', function (code) {
          t.equal(code, 0, 'exited without issue')
          resolve()
        })
      })
    })
  })
})

test('cleanup', function (t) {
  return rimraf(root)
})
