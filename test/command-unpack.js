var join = require('path').join
var statSync = require('graceful-fs').statSync

var Bluebird = require('bluebird')
var promisify = Bluebird.promisify
var readFile = promisify(require('graceful-fs').readFile)
var rimraf = promisify(require('rimraf'))
var test = require('tap').test

var unpack = require('../lib/command/unpack.js').default

var metadata = require('./lib/metadata.js')
var zip = require('./lib/zip.js')

var root = join(__dirname, 'single-artist-unpack')

test('unpacking nothing', function (t) {
  return unpack({}).then(function (albums) {
    t.equal(albums.size, 0)
  })
})

test('unpacking a single-artist album', function (t) {
  var staging = join(root, 'staging', 'flac')
  var flacRoot = join(root, 'flac')
  var albumRoot = join(flacRoot, 'Gary Beck', 'Feel It')

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
    return zip.pack(join(root, 'Feel It.zip'), paths)
  })

  var unpackZip = makeZip.then(function (zipfile) {
    return unpack({ files: [zipfile] }, staging)
  })

  return unpackZip.then(function (albums) {
    t.equal(albums.size, 1, 'got 1 album back')
    var album = albums.values().next().value
    t.ok(album, 'found album OK')
    t.equal(album.artist.name, 'Gary Beck', 'got correct artist name')
    t.equal(album.name, 'Feel It', 'got correct album name')
    t.equal(album.tracks.length, 3, 'album has its tracks')
  })
})

test('unpacking album and making a playlist', function (t) {
  var staging = join(root, 'staging', 'flac')
  var flacRoot = join(root, 'flac')
  var albumRoot = join(flacRoot, 'Demdike Stare', 'Testpressing 006')
  var playlist = join(root, 'untilted.pls')

  var makeAlbum = rimraf(root).then(function () {
    return metadata.makeAlbum(
      albumRoot,
      '2014-08-26',
      'Demdike Stare',
      'Testpressing #006',
      [
        { name: '40 Years Under the Cosh' },
        { name: "Frontin'" }
      ]
    )
  })

  var makeZip = makeAlbum.then(function (paths) {
    t.equal(paths.length, 2, 'both FLAC files written')
    return zip.pack(join(root, 'Testpressing-006.zip'), paths)
  })

  var unpackZip = makeZip.then(function (zipfile) {
    return unpack({ files: [zipfile] }, staging, null, playlist)
  })

  return unpackZip.then(function (albums) {
    t.equal(albums.size, 1, 'got 1 album back')
    return readFile(playlist, { encoding: 'utf8' })
      .then(function (contents) {
        t.matches(contents, /^\[playlist\]/)
        t.matches(contents, /NumberOfEntries=2/)
        t.matches(contents, /File1.+40 Years/)
        t.matches(contents, /Title1=40 Years Under the Cosh/)
        t.matches(contents, /File2.+Frontin/)
        t.matches(contents, /Title2=Frontin'/)
      })
  })
})

test('unpacking two albums and ensuring sort', function (t) {
  var staging = join(root, 'staging', 'flac')
  var flacRoot = join(root, 'flac')
  var firstRoot = join(flacRoot, 'Demdike Stare', 'Testpressing 002')
  var secondRoot = join(flacRoot, 'Demdike Stare', 'Testpressing 005')
  var output = ''
  var _log

  var makeAlbums = rimraf(root).then(function () {
    // oh god these have to be done in sequence because of the statefulness of
    // FLACProcessor
    return metadata.makeAlbum(
      secondRoot,
      '2014-07-03',
      'Demdike Stare',
      'Testpressing #005',
      [
        { name: 'Procrastination' },
        { name: 'Past Majesty' }
      ]
    ).then(function (secondPaths) {
      return metadata.makeAlbum(
        firstRoot,
        '2014-04-17',
        'Demdike Stare',
        'Testpressing #002',
        [
          { name: 'Grows Without Bound' },
          { name: 'Primitive Equations' }
        ]
      ).then(function (firstPaths) { return firstPaths.concat(secondPaths) })
    })
  })

  var makeZip = makeAlbums.then(function (paths) {
    t.equal(paths.length, 4, 'all 4 FLAC files written')
    return zip.pack(join(root, 'Testpressings.zip'), paths)
  })

  var unpackZip = makeZip.then(function (zipfile) {
    _log = console.log
    console.log = function () {
      output += require('util').format.apply(console, arguments)
    }
    return unpack({ files: [zipfile] }, staging)
  })

  return unpackZip.then(function (albums) {
    console.log = _log
    t.equal(albums.size, 2, 'got 2 albums back')
    t.match(output, /Testpressing 002.+Testpressing 005/)
  })
})

test('unpacking two albums and ensuring sort with same date', function (t) {
  var staging = join(root, 'staging', 'flac')
  var flacRoot = join(root, 'flac')
  var firstRoot = join(flacRoot, 'Demdike Stare', 'Testpressing 002')
  var secondRoot = join(flacRoot, 'Demdike Stare', 'Testpressing 005')
  var output = ''
  var _log

  var makeAlbums = rimraf(root).then(function () {
    // oh god these have to be done in sequence because of the statefulness of
    // FLACProcessor
    return metadata.makeAlbum(
      secondRoot,
      '2014',
      'Demdike Stare',
      'Testpressing #005',
      [
        { name: 'Procrastination' },
        { name: 'Past Majesty' }
      ]
    ).then(function (secondPaths) {
      return metadata.makeAlbum(
        firstRoot,
        '2014',
        'Demdike Stare',
        'Testpressing #002',
        [
          { name: 'Grows Without Bound' },
          { name: 'Primitive Equations' }
        ]
      ).then(function (firstPaths) { return firstPaths.concat(secondPaths) })
    })
  })

  var makeZip = makeAlbums.then(function (paths) {
    t.equal(paths.length, 4, 'all 4 FLAC files written')
    return zip.pack(join(root, 'Testpressings.zip'), paths)
  })

  var unpackZip = makeZip.then(function (zipfile) {
    _log = console.log
    console.log = function () {
      output += require('util').format.apply(console, arguments)
    }
    return unpack({ files: [zipfile] }, staging)
  })

  return unpackZip.then(function (albums) {
    console.log = _log
    t.equal(albums.size, 2, 'got 2 albums back')
    t.match(output, /Testpressing 002.+Testpressing 005/)
  })
})

test('unpacking and archiving a single-artist album with cruft', function (t) {
  var staging = join(root, 'staging', 'flac')
  var zipfile = join(root, 'low-ones_and_sixes-flac-sp144.zip')
  var archive = join(root, 'archive')
  var archivedZip = join(archive, 'low-ones_and_sixes-flac-sp144.zip')

  var makeFLACs = rimraf(root).then(function () {
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
  })

  var makeCruft = makeFLACs.then(function (paths) {
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
        'low-ones_and_sixes-flac/README.txt',
        'low-ones_and_sixes-flac/album.cue',
        'low-ones_and_sixes-flac/cover.jpeg',
        'low-ones_and_sixes-flac/.DS_Store'
      ]
    )
  })

  var makeZip = makeCruft.then(function (paths) {
    t.equal(paths.length, 30, '12 FLAC files and 18 other files written')
    return zip.pack(zipfile, paths)
  })

  var unpackZip = makeZip.then(function () {
    t.doesNotThrow(function () {
      t.ok(statSync(zipfile), 'zipfile is where it should be')
    }, 'zipfile created')

    return unpack({ roots: [root], pattern: '*.zip' }, staging, archive)
  })

  return unpackZip.then(function (albums) {
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
    t.equal(album.pictures.length, 1, 'album has a cover')

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
  })
})

test('cleanup', function () { return rimraf(root) })
