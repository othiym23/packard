var join = require('path').join

var test = require('tap').test

var Bluebird = require('bluebird')
var promisify = Bluebird.promisify
var rimraf = promisify(require('rimraf'))

var find = require('../lib/utils/find.js').default

var makeAlbum = require('./lib/metadata.js').makeAlbum
var makeStubFiles = require('./lib/metadata.js').makeStubFiles

var testRoot = join(__dirname, 'utils-find')

function contains (desired, paths) {
  function pred (p) {
    return paths.has(join(testRoot, p)) !== -1
  }
  return desired.filter(pred).length === desired.length
}

function doesNotContain (unwanted, paths) {
  return !unwanted.some(function (u) { return paths.has(u) })
}

test('reject cruft', function (t) {
  var makeFLACs = rimraf(testRoot).then(function () {
    return makeAlbum(
      testRoot,
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
  })

  var makeCruft = makeFLACs.then(function (paths) {
    t.equal(paths.length, 12, '12 FLAC files written')
    return makeStubFiles(
      testRoot,
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
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-01_gentle.flac',
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-02_no_comprende.flac',
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-03_spanish_translation.flac',
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-04_congregation.flac',
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-05_no_end.flac',
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-06_into_you.flac',
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-07_what_part_of_me.flac',
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-08_the_innocents.flac',
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-09_kid_in_the_corner.flac',
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-10_lies.flac',
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-11_landslide.flac',
        'low-ones_and_sixes-flac/.AppleDouble/sp1144-12_dj.flac',
        'low-ones_and_sixes-flac/README.txt',
        'low-ones_and_sixes-flac/album.cue',
        'low-ones_and_sixes-flac/cover.jpeg',
        'low-ones_and_sixes-flac/.DS_Store'
      ]
    )
  })

  return makeCruft.then(function (paths) {
    t.equal(paths.length, 42, '12 FLAC files and 18 other files written')
    return find([testRoot])
      .then(function (found) {
        t.equal(found.size, 15, 'found album and other files')
        t.ok(contains([
          'low-ones_and_sixes-flac/sp1144-01_gentle.flac',
          'low-ones_and_sixes-flac/sp1144-02_no_comprende.flac',
          'low-ones_and_sixes-flac/sp1144-03_spanish_translation.flac',
          'low-ones_and_sixes-flac/sp1144-04_congregation.flac',
          'low-ones_and_sixes-flac/sp1144-05_no_end.flac',
          'low-ones_and_sixes-flac/sp1144-06_into_you.flac',
          'low-ones_and_sixes-flac/sp1144-07_what_part_of_me.flac',
          'low-ones_and_sixes-flac/sp1144-08_the_innocents.flac',
          'low-ones_and_sixes-flac/sp1144-09_kid_in_the_corner.flac',
          'low-ones_and_sixes-flac/sp1144-10_lies.flac',
          'low-ones_and_sixes-flac/sp1144-11_landslide.flac',
          'low-ones_and_sixes-flac/sp1144-12_dj.flac',
          'low-ones_and_sixes-flac/README.txt',
          'low-ones_and_sixes-flac/album.cue',
          'low-ones_and_sixes-flac/cover.jpeg'
        ], found), 'expected files found')

        t.ok(doesNotContain([
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
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-01_gentle.flac',
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-02_no_comprende.flac',
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-03_spanish_translation.flac',
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-04_congregation.flac',
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-05_no_end.flac',
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-06_into_you.flac',
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-07_what_part_of_me.flac',
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-08_the_innocents.flac',
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-09_kid_in_the_corner.flac',
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-10_lies.flac',
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-11_landslide.flac',
          'low-ones_and_sixes-flac/.AppleDouble/sp1144-12_dj.flac',
          'low-ones_and_sixes-flac/.DS_Store'
        ], found), 'cruft filtered out')
      })
  })
})

test('cleanup', function () { return rimraf(testRoot) })
