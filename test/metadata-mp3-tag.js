var createReadStream = require('fs').createReadStream
var createWriteStream = require('fs').createWriteStream
var join = require('path').join
var spawn = require('child_process').spawn

var concat = require('mississippi').concat
var log = require('npmlog')
var model = require('@packard/model')
var pipe = require('mississippi').pipe
var test = require('tap').test
var Bluebird = require('bluebird')
var Track = model.Track

var mkdirp = Bluebird.promisify(require('mkdirp'))
var rimraf = Bluebird.promisify(require('rimraf'))
var which = Bluebird.promisify(require('which'))

var scan = require('../lib/metadata/scan.js').default
var tag = require('../lib/metadata/mp3/tag.js').default

var metadata = require('./lib/metadata.js')

var root = join(__dirname, 'metadata mp3 tag')

test('missing track', function (t) {
  t.throws(tag)
  t.end()
})

test('missing path', function (t) {
  t.throws(function () { tag(new Track()) })
  t.end()
})

test('simple tagging', function (t) {
  var source = join(root, 'source')
  var destination = join(root, 'destination')
  var simple = join(destination, 'simple.mp3')

  var makeAlbum = rimraf(root).then(function () {
    return metadata.makeAlbum(
      source,
      '1992-04-15',
      'The Orb',
      'Blue Room',
      [{ name: 'Blue Room (\'Unreleased Mix\')' }]
    )
  })

  var readTrack = makeAlbum.then(function (paths) {
    log.silly('simpleTest', 'encoded', paths)
    return scan({ path: paths[0] }, new Map())
  })

  var makeDestination = readTrack.then(function (track) {
    return mkdirp(destination).return(track)
  })

  var copyBlank = makeDestination.then(function (track) {
    return new Bluebird(function (resolve, reject) {
      pipe(
        createReadStream(join(__dirname, 'fixtures/empty.mp3')),
        createWriteStream(simple),
        function (err) {
          if (err) return reject(err)

          resolve(track)
        }
      )
    })
  })

  var writeTag = copyBlank.then(function (track) {
    return tag(track, simple)
  })

  var ensureMp3val = writeTag.then(function () {
    return which('mp3val')
  })

  return ensureMp3val.then(function (mp3val) {
    return new Bluebird(function (resolve, reject) {
      var verifier = spawn(
        mp3val,
        [simple],
        {}
      )

      pipe(verifier.stdout, concat({ encoding: 'string' }, function (output) {
        t.match(
          output,
          /8 MPEG frames \(MPEG 1 Layer III\), \+ID3v2, Xing header/m,
          'found expected stream content'
        )
      }))

      pipe(verifier.stderr, concat({ encoding: 'string' }, function (output) {
        t.notOk(output, 'no error output from mp3val')
      }))

      verifier.on('error', reject)
      verifier.on('close', function (code) {
        t.equal(code, 0, 'mp3val is happy')
        resolve()
      })
    })
  })
})

test('cleanup', function (t) {
  return rimraf(root)
})
