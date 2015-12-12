require('babel-polyfill')

var join = require('path').join
var statSync = require('graceful-fs').statSync

var Bluebird = require('bluebird')
var promisify = Bluebird.promisify
var log = require('npmlog')
var rimraf = promisify(require('rimraf'))
var test = require('tap').test

var unzip = require('../lib/utils/zip.js').unpack

var metadata = require('./lib/metadata.js')
var zip = require('./lib/zip.js')

var root = join(__dirname, 'single-artist-zipped')

test('calling unzip with bad arguments', function (t) {
  t.test('no path, no progress groups, no target directory', function (t) {
    return Bluebird.try(unzip)
      .then(function () { t.fail("shouldn't work with no arguments") })
      .catch(function (er) {
        t.match(er.message, /Missing required argument/)
      })
  })

  t.test('no progress groups, no target directory', function (t) {
    return Bluebird.try(function () { unzip('/nonexistent') })
      .then(function () { t.fail("shouldn't work with no arguments") })
      .catch(function (er) {
        t.match(er.message, /Missing required argument/)
      })
  })

  t.test('no target directory', function (t) {
    return Bluebird.try(function () { unzip('/nonexistent', new Map()) })
      .then(function () { t.fail("shouldn't work with no arguments") })
      .catch(function (er) {
        t.match(er.message, /Missing required argument/)
      })
  })

  t.end()
})

test('unpacking without creating a progress group first', function (t) {
  var staging = join(root, 'staging', 'flac')
  var flacRoot = join(root, 'flac')
  var albumRoot = join(flacRoot, 'The Necks', 'Open')
  var archivePath = join(root, 'Open.zip')

  var makeAlbum = rimraf(root).then(function () {
    return metadata.makeAlbum(
      albumRoot,
      '2012-01-20',
      'The Necks',
      'Open',
      [{ name: 'Open' }]
    )
  })

  var makeZip = makeAlbum.then(function (paths) {
    return zip.pack(archivePath, paths)
  })

  var unpackZip = makeZip.then(function (zipfile) {
    return unzip(zipfile, new Map(), staging)
  })

  return unpackZip.then(function (metadata) {
    t.ok(metadata)
    t.equal(metadata.length, 1)
    metadata.forEach(function (md) {
      t.ok(md.path)
      t.match(md.path, staging)
      t.ok(statSync(md.path))
      t.ok(md.extractedTrack)
      t.equal(md.extractedTrack && md.extractedTrack.date, '2012-01-20')
      t.ok(md.sourceArchive)
      t.equal(md.sourceArchive && md.sourceArchive.path, archivePath)
    })
  })
})

test('unpacking a single-artist album', function (t) {
  var staging = join(root, 'staging', 'flac')
  var flacRoot = join(root, 'flac')
  var albumRoot = join(flacRoot, 'Gary Beck', 'Feel It')
  var archivePath = join(root, 'Gary Beck - Feel It.zip')

  var makeAlbum = rimraf(root).then(function () {
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
  })

  var makeZip = makeAlbum.then(function (paths) {
    t.equal(paths.length, 3, 'all three FLAC files written')
    return zip.pack(archivePath, paths)
  })

  var unpackZip = makeZip.then(function (zipfile) {
    var groups = new Map()
    groups.set(zipfile, log.newGroup('test'), staging)
    return unzip(zipfile, groups, staging)
  })

  return unpackZip.then(function (metadata) {
    t.ok(metadata)
    t.equal(metadata.length, 3)
    metadata.forEach(function (md) {
      t.ok(md.path)
      t.match(md.path, staging)
      t.ok(statSync(md.path))
      t.ok(md.extractedTrack)
      t.equal(md.extractedTrack && md.extractedTrack.date, '2012-01-20')
      t.ok(md.sourceArchive)
      t.equal(md.sourceArchive && md.sourceArchive.path, archivePath)
    })
  })
})

test('cleanup', function (t) { return rimraf(root) })
