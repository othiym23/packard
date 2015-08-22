var Promise = require('bluebird')
var promisify = Promise.promisify

var join = require('path').join

var log = require('npmlog')
var rimraf = promisify(require('rimraf'))
var test = require('tap').test

var zipUtils = require('../lib/utils/zip.js')

var metadata = require('./lib/metadata.js')
var zip = require('./lib/zip.js')

var root = join(__dirname, 'single-artist-zipped')

test('unpacking a single-artist album', function (t) {
  var staging = join(root, 'staging', 'flac')
  var flacRoot = join(root, 'flac')
  var albumRoot = join(flacRoot, 'Gary Beck', 'Feel It')
  var groups = new Map()

  rimraf(root).then(function () {
    return metadata.makeAlbum(
      albumRoot,
      '2012-01-20',
      'Gary Beck',
      'Feel It',
      [
        'Feel It',
        'Paid Out',
        'Hillview'
      ]
    )
  }).then(function (paths) {
    t.equal(paths.length, 3, 'all three FLAC files written')
    return zip.pack(join(root, 'Feel It.zip'), paths)
  }).then(function (zipfile) {
    groups.set(zipfile, log.newGroup('test'), staging)
    return zipUtils.unpack(zipfile, groups, staging)
             .catch(function (e) {
                t.ifError(e, 'unzipping file succeeded')
              })
  }).catch(function (e) {
    t.ifError(e, 'creating album succeeded')
  }).finally(function () {
    t.end()
  })
})

test('cleanup', function (t) {
  rimraf(root).then(function () { t.end() })
})
