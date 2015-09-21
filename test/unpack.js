var join = require('path').join
var statSync = require('graceful-fs').statSync

var Bluebird = require('bluebird')
var promisify = Bluebird.promisify
var rimraf = promisify(require('rimraf'))
var test = require('tap').test

var unpack = require('../lib/unpack.js')

var metadata = require('./lib/metadata.js')
var zip = require('./lib/zip.js')

var root = join(__dirname, 'single-artist-unpack')

test('unpacking a single-artist album', function (t) {
  var staging = join(root, 'staging', 'flac')
  var flacRoot = join(root, 'flac')
  var albumRoot = join(flacRoot, 'Gary Beck', 'Feel It')

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
    return unpack([zipfile], staging)
             .catch(function (e) {
               t.ifError(e, 'unpacking zipfile succeeded')
             })
  }).then(function (albums) {
    t.equal(albums.size, 1, 'got 1 album back')
    var album = albums.values().next().value
    t.ok(album, 'found album OK')
    t.equal(album.artist.name, 'Gary Beck', 'got correct artist name')
    t.equal(album.name, 'Feel It', 'got correct album name')
    t.equal(album.tracks.length, 3, 'album has its tracks')
  }).catch(function (e) {
    t.ifError(e, 'creating album succeeded')
  }).finally(function () {
    t.end()
  })
})

test('unpacking and archiving a single-artist album with cruft', function (t) {
  var staging = join(root, 'staging', 'flac')
  var zipfile = join(root, 'low-ones_and_sixes-flac-sp144.zip')
  var archive = join(root, 'archive')
  var archivedZip = join(archive, 'low-ones_and_sixes-flac-sp144.zip')

  rimraf(root).then(function () {
    return metadata.makeAlbum(
      root,
      '2015-09-11',
      'Low',
      'Ones and Sixes',
      [
        {
          name: 'Gentle',
          path: 'low-ones_and_sixes-flac/sp1144-01_gentle.flac'
        },
        {
          name: 'No Comprende',
          path: 'low-ones_and_sixes-flac/sp1144-02_no_comprende.flac'
        },
        {
          name: 'Spanish Translation',
          path: 'low-ones_and_sixes-flac/sp1144-03_spanish_translation.flac'
        },
        {
          name: 'Congregation',
          path: 'low-ones_and_sixes-flac/sp1144-04_congregation.flac'
        },
        {
          name: 'No End',
          path: 'low-ones_and_sixes-flac/sp1144-05_no_end.flac'
        },
        {
          name: 'Into You',
          path: 'low-ones_and_sixes-flac/sp1144-06_into_you.flac'
        },
        {
          name: 'What Part of Me',
          path: 'low-ones_and_sixes-flac/sp1144-07_what_part_of_me.flac'
        },
        {
          name: 'The Innocents',
          path: 'low-ones_and_sixes-flac/sp1144-08_the_innocents.flac'
        },
        {
          name: 'Kid In the Corner',
          path: 'low-ones_and_sixes-flac/sp1144-09_kid_in_the_corner.flac'
        },
        {
          name: 'Lies',
          path: 'low-ones_and_sixes-flac/sp1144-10_lies.flac'
        },
        {
          name: 'Landslide',
          path: 'low-ones_and_sixes-flac/sp1144-11_landslide.flac'
        },
        {
          name: 'DJ',
          path: 'low-ones_and_sixes-flac/sp1144-12_dj.flac'
        }
      ]
    )
  }).then(function (paths) {
    t.equal(paths.length, 12, '12 FLAC files written')
    return metadata.makeStubFiles(
      root,
      paths,
      [
        '__MACOSX/._low-ones_and_sixes-flac',
        '__MACOSX/low-ones_and_sixes-flac/._.DS_Store',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-01_gentle.flac',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-02_no_comprende.flac',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-03_spanish_translation.flac',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-04_congregation.flac',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-05_no_end.flac',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-06_into_you.flac',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-07_what_part_of_me.flac',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-08_the_innocents.flac',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-09_kid_in_the_corner.flac',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-10_lies.flac',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-11_landslide.flac',
        '__MACOSX/low-ones_and_sixes-flac/._sp1144-12_dj.flac',
        'low-ones_and_sixes-flac/.DS_Store'
      ]
    )
  }).then(function (paths) {
    t.equal(paths.length, 27, '12 FLAC files and 15 cruft files written')
    return zip.pack(zipfile, paths)
  }).then(function () {
    t.doesNotThrow(function () {
      t.ok(statSync(zipfile), 'zipfile is where it should be')
    }, 'zipfile created')

    return unpack([zipfile], staging, null, null, true, archive)
             .catch(function (e) {
               t.ifError(e, 'unpacking zipfile succeeded')
             })
  }).then(function (albums) {
    t.throws(function () { statSync(zipfile) }, 'zipfile gone from old location')
    t.doesNotThrow(function () {
      t.ok(statSync(archivedZip), 'zipfile has moved')
    }, 'zipfile moved to expected location')

    t.equal(albums.size, 1, 'got 1 album back')
    var album = albums.values().next().value
    t.ok(album, 'found album OK')
    t.equal(album.artist.name, 'Low', 'got correct artist name')
    t.equal(album.name, 'Ones and Sixes', 'got correct album name')
    t.equal(album.tracks.length, 12, 'album has its tracks')

    var stagedPath = join(staging, 'Low', '[2015-09-11] Ones and Sixes')
    var prefix = 'Low - Ones and Sixes - '
    var tracks = [
      '01 - Gentle',
      '02 - No Comprende',
      '03 - Spanish Translation',
      '04 - Congregation',
      '05 - No End',
      '06 - Into You',
      '07 - What Part of Me',
      '08 - The Innocents',
      '09 - Kid In the Corner',
      '10 - Lies',
      '11 - Landslide',
      '12 - DJ'
    ].map(function (t) { return join(stagedPath, prefix + t + '.flac') })
    tracks.forEach(function (unpacked) {
      t.doesNotThrow(statSync.bind(null, unpacked), 'track staged')
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
