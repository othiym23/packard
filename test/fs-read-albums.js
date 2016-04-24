require('babel-polyfill') // needed for Sets and Maps

var join = require('path').join
var writeFileSync = require('graceful-fs').writeFileSync

var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var test = require('tap').test
var Album = require('@packard/model').MultitrackAlbum
var Artist = require('@packard/model').Artist
var Cover = require('@packard/model').Cover
var Cuesheet = require('@packard/model').Cuesheet
var Track = require('@packard/model').Track

var attachCoversToAlbums = require('../lib/fs/read-albums.js').attachCoversToAlbums
var readAlbums = require('../lib/fs/read-albums.js').default
var remapCovers = require('../lib/fs/read-albums.js').remapCovers
var remapCuesheets = require('../lib/fs/read-albums.js').remapCuesheets
var toBaseAlbumLocation = require('../lib/fs/read-albums.js').toBaseAlbumLocation
var toBaseTrackName = require('../lib/fs/read-albums.js').toBaseTrackName
var tracksToAlbums = require('../lib/fs/read-albums.js').tracksToAlbums

var basedir = join(__dirname, 'test-fs-read-albums')

function iteratorToArray (collection) {
  var iterator = collection[Symbol.iterator]()
  var array = []
  for (var current = iterator.next(); !current.done; current = iterator.next()) {
    array.push(current.value)
  }
  return array
}

function setup () {
  cleanup()
  mkdirp.sync(basedir)
}

function cleanup () {
  rimraf.sync(basedir)
}

test('setup', function (t) {
  setup()
  t.end()
})

test('toBaseAlbumLocation units', function (t) {
  t.throws(function () { toBaseAlbumLocation() }, 'blows up on undefined')
  t.throws(function () { toBaseAlbumLocation(null) }, 'blows up on null')

  t.equal(
    toBaseAlbumLocation('/home/user/Artist/Album/Cover.jpeg'),
    '/home/user/Artist/Album'
  )
  t.equal(
    toBaseAlbumLocation('/home/user/Artist/Album/Subdir/'),
    '/home/user/Artist/Album'
  )

  t.end()
})

test('toBaseTrackName units', function (t) {
  t.throws(function () { toBaseTrackName() }, 'blows up on undefined')
  t.throws(function () { toBaseTrackName(null) }, 'blows up on null')

  t.equal(
    toBaseTrackName('/home/user/Artist/Album/This is a Club Track.flac'),
    '/home/user/Artist/Album/This is a Club Track'
  )
  t.equal(
    toBaseTrackName('/home/user/Artist/Album/Subdir/'),
    '/home/user/Artist/Album/Subdir'
  )

  t.end()
})

test('remapCovers units', function (t) {
  t.throws(function () { remapCovers() }, 'blows up on undefined')
  t.throws(function () { remapCovers(null) }, 'blows up on null')

  t.doesNotThrow(function () { remapCovers(new Set()) }, 'handles empty cover list')
  t.equal(remapCovers(new Set()).size, 0)

  t.test('for single cover', function (t) {
    var path = '/user/home/Artist/Album/cover.png'
    var statsStub = {}
    var cover = new Cover(path, statsStub)
    var first = new Set([{ path: path, cover: cover }])

    var remapped = remapCovers(first)
    t.equal(remapped.size, 1)
    var coverPair = iteratorToArray(remapped)[0]
    t.equal(coverPair[0], '/user/home/Artist/Album')
    var covers = coverPair[1]
    t.equal(covers.size, 1)
    var coverArray = iteratorToArray(covers)
    t.same(coverArray[0], cover)
    t.end()
  })

  t.test('for 2 covers in 1 directory', function (t) {
    var path1 = '/user/home/Artist/Album/cover-1.pdf'
    var path2 = '/user/home/Artist/Album/cover-2.pdf'
    var statsStub = {}
    var cover1 = new Cover(path1, statsStub)
    var cover2 = new Cover(path2, statsStub)
    var second = new Set([
      { path: path1, cover: cover1 },
      { path: path2, cover: cover2 }
    ])

    var remapped = remapCovers(second)
    t.equal(remapped.size, 1)
    var coverPair = iteratorToArray(remapped)[0]
    t.equal(coverPair[0], '/user/home/Artist/Album')
    var covers = coverPair[1]
    t.equal(covers.size, 2)
    var coverArray = iteratorToArray(covers)
    t.same(coverArray[0], cover1)
    t.same(coverArray[1], cover2)
    t.end()
  })

  t.test('for 2 covers in 2 directories', function (t) {
    var path1 = '/user/home/Artist/Album1/cover.jpg'
    var path2 = '/user/home/Artist/Album2/cover.gif'
    var statsStub = {}
    var cover1 = new Cover(path1, statsStub)
    var cover2 = new Cover(path2, statsStub)
    var third = new Set([
      { path: path1, cover: cover1 },
      { path: path2, cover: cover2 }
    ])

    var remapped = remapCovers(third)
    t.equal(remapped.size, 2)
    var pairs = iteratorToArray(remapped)
    var firstPair = pairs[0]
    t.equal(firstPair[0], '/user/home/Artist/Album1')
    var covers = firstPair[1]
    t.equal(covers.size, 1)
    var coverArray = iteratorToArray(covers)
    t.same(coverArray[0], cover1)
    var secondPair = pairs[1]
    t.equal(secondPair[0], '/user/home/Artist/Album2')
    covers = secondPair[1]
    t.equal(covers.size, 1)
    coverArray = iteratorToArray(covers)
    t.same(coverArray[0], cover2)
    t.end()
  })

  t.end()
})

test('remapCuesheets units', function (t) {
  t.throws(function () { remapCuesheets() }, 'blows up on undefined')
  t.throws(function () { remapCuesheets(null) }, 'blows up on null')

  t.doesNotThrow(function () { remapCuesheets(new Set()) }, 'handles empty cuesheet list')
  t.equal(remapCuesheets(new Set()).size, 0)

  t.test('basic cuesheet', function (t) {
    var path = '/user/home/Artist/Album/Fight the Power.cue'
    var statsStub = {}
    var cuesheet = new Cuesheet(path, statsStub)
    var first = new Set([{ path: path, cuesheet: cuesheet }])

    var remapped = remapCuesheets(first)
    t.equal(remapped.size, 1)
    var cuesheetPair = iteratorToArray(remapped)[0]
    t.equal(cuesheetPair[0], '/user/home/Artist/Album/Fight the Power')
    t.same(cuesheetPair[1], cuesheet)
    t.end()
  })

  t.test('for 2 cuesheets in 2 directories', function (t) {
    var path1 = '/user/home/Artist/Album1/It Takes a Nation of Millions.cue'
    var path2 = '/user/home/Artist/Album2/Fear of a Black Planet.cue'
    var statsStub = {}
    var cuesheet1 = new Cuesheet(path1, statsStub)
    var cuesheet2 = new Cuesheet(path2, statsStub)
    var second = new Set([
      { path: path1, cuesheet: cuesheet1 },
      { path: path2, cuesheet: cuesheet2 }
    ])

    var remapped = remapCuesheets(second)
    t.equal(remapped.size, 2)
    var pairs = iteratorToArray(remapped)
    var firstPair = pairs[0]
    t.equal(firstPair[0], '/user/home/Artist/Album1/It Takes a Nation of Millions')
    t.same(firstPair[1], cuesheet1)
    var secondPair = pairs[1]
    t.equal(secondPair[0], '/user/home/Artist/Album2/Fear of a Black Planet')
    t.same(secondPair[1], cuesheet2)
    t.end()
  })

  t.test('for cuesheets with same base name in different directories', function (t) {
    var path1 = '/user/home/Artist/Album1/Fear of a Black Planet.cue'
    var path2 = '/user/home/Artist/Album2/Fear of a Black Planet.cue'
    var statsStub = {}
    var cuesheet1 = new Cuesheet(path1, statsStub)
    var cuesheet2 = new Cuesheet(path2, statsStub)
    var third = new Set([
      { path: path1, cuesheet: cuesheet1 },
      { path: path2, cuesheet: cuesheet2 }
    ])

    var remapped = remapCuesheets(third)
    t.equal(remapped.size, 2)
    var pairs = iteratorToArray(remapped)
    var firstPair = pairs[0]
    t.equal(firstPair[0], '/user/home/Artist/Album1/Fear of a Black Planet')
    t.same(firstPair[1], cuesheet1)
    var secondPair = pairs[1]
    t.equal(secondPair[0], '/user/home/Artist/Album2/Fear of a Black Planet')
    t.same(secondPair[1], cuesheet2)
    t.end()
  })

  t.test('for the same cuesheet twice (last write wins)', function (t) {
    var path1 = '/user/home/Artist/Album/Fear of a Black Planet.cue'
    var path2 = '/user/home/Artist/Album/Fear of a Black Planet.cue'
    var statsStub = {}
    var cuesheet1 = new Cuesheet(path1, statsStub)
    var cuesheet2 = new Cuesheet(path2, statsStub)
    var fourth = new Set([
      { path: path1, cuesheet: cuesheet1 },
      { path: path2, cuesheet: cuesheet2 }
    ])

    var remapped = remapCuesheets(fourth)
    t.equal(remapped.size, 1)
    var pair = iteratorToArray(remapped)[0]
    t.equal(pair[0], '/user/home/Artist/Album/Fear of a Black Planet')
    t.same(pair[1], cuesheet1)
    t.end()
  })

  t.end()
})

test('tracksToAlbums units', function (t) {
  t.throws(
    function () { tracksToAlbums() },
    'blows up on undefined first param'
  )
  t.throws(
    function () { tracksToAlbums(null) },
    'blows up on null first param'
  )
  t.throws(
    function () { tracksToAlbums(new Set()) },
    'blows up on undefined second param'
  )
  t.throws(
    function () { tracksToAlbums(new Set(), null) },
    'blows up on null second param'
  )

  t.doesNotThrow(
    function () { tracksToAlbums(new Set(), new Map()) },
    'handles empty cover list'
  )
  t.equal(tracksToAlbums(new Set(), new Map()).size, 0)

  t.test('barfs on non-track metadata', function (t) {
    var coverPath = '/user/home/Artist/Album/cover.jpg'
    var trackPath = '/user/home/Go Crazy.mp3'
    var statsStub = {}
    var artistStub = new Artist('stub')
    var albumStub = new Album('stub', artistStub)
    t.throws(function () {
      tracksToAlbums(
        new Set([{
          path: coverPath,
          cover: new Cover(coverPath, statsStub)
        }]),
        new Map()
      )
    }, 'not a track at all')

    t.throws(function () {
      tracksToAlbums(
        new Set([{
          path: trackPath,
          fsArtist: artistStub,
          fsTrack: new Track(trackPath, albumStub, artistStub, { stats: statsStub })
        }]),
        new Map()
      )
    }, 'missing fsAlbum')

    t.throws(function () {
      tracksToAlbums(
        new Set([{
          path: trackPath,
          fsAlbum: albumStub,
          fsArtist: artistStub
        }]),
        new Map()
      )
    }, 'missing fsTrack')

    t.doesNotThrow(function () {
      tracksToAlbums(
        new Set([{
          path: trackPath,
          fsAlbum: albumStub,
          fsArtist: artistStub,
          fsTrack: new Track(trackPath, albumStub, artistStub, { stats: statsStub })
        }]),
        new Map()
      )
    }, 'everything present')

    t.end()
  })

  t.test('attaches cuesheet to single-track album', function (t) {
    var albumBase = '/user/home/Artist/Album'
    var trackPath = join(albumBase, '4ward.flac')
    var statsStub = {}
    var artistStub = new Artist('stub')
    var albumStub = new Album('stub', artistStub)
    var cuesheet = new Cuesheet(join(albumBase, '4ward.cue'), statsStub)

    var tracks = new Set([{
      path: trackPath,
      fsAlbum: albumStub,
      fsArtist: artistStub,
      fsTrack: new Track(trackPath, albumStub, artistStub, { stats: statsStub })
    }])
    var cuesheets = remapCuesheets(new Set([
      { path: cuesheet.path, cuesheet: cuesheet }
    ]))

    var albums = tracksToAlbums(tracks, cuesheets)
    t.equal(albums.size, 1)
    var albumPair = iteratorToArray(albums)[0]
    t.equal(albumPair[0], albumBase)
    t.same(albumPair[1].cuesheet, cuesheet)

    t.end()
  })

  t.end()
})

test('attachCoversToAlbums units', function (t) {
  t.throws(
    function () { attachCoversToAlbums() },
    'blows up on undefined first param'
  )
  t.throws(
    function () { attachCoversToAlbums(null) },
    'blows up on null first param'
  )
  t.throws(
    function () { attachCoversToAlbums(new Map()) },
    'blows up on undefined second param'
  )
  t.throws(
    function () { attachCoversToAlbums(new Map(), null) },
    'blows up on null second param'
  )

  t.doesNotThrow(
    function () { attachCoversToAlbums(new Map(), new Map()) },
    'handles empty cover list'
  )
  t.equal(attachCoversToAlbums(new Map(), new Map()).size, 0)

  t.test('attaches cover to album', function (t) {
    var albumBase = '/user/home/Artist/Album'
    var statsStub = {}
    var artistStub = new Artist('stub')
    var albumStub = new Album('stub', artistStub)
    var cover = new Cover(join(albumBase, 'cover.jpeg'), statsStub)

    var albums = new Map([[albumBase, albumStub]])
    var covers = remapCovers(new Set([{ path: cover.path, cover: cover }]))

    albums = attachCoversToAlbums(albums, covers)
    t.equal(albums.size, 1)
    var albumPair = iteratorToArray(albums)[0]
    t.equal(albumPair[0], albumBase)
    t.equal(albumPair[1].pictures.length, 1)
    t.same(albumPair[1].pictures[0], cover)

    t.end()
  })

  t.end()
})

test('read empty root', function (t) {
  setup()
  return readAlbums(basedir).then(
    function (albums) {
      t.equal(albums.size, 0, 'no albums found in empty tree')
    },
    function (err) {
      t.ifErr(err, "shouldn't crash on empty directory")
    }
  )
})

test('read root with one empty artist directory', function (t) {
  setup()
  mkdirp.sync(join(basedir, 'eMPTy'))
  return readAlbums(basedir).then(function (albums) {
    t.equal(albums.size, 0, 'no albums found in empty tree')
  })
})

test('read root with one empty album directory', function (t) {
  setup()
  mkdirp.sync(join(basedir, 'eMPTy', 'nOTHINg'))
  return readAlbums(basedir).then(function (albums) {
    t.equal(albums.size, 0, 'no albums found in empty tree')
  })
})

test('read root with one one-track directory, no cue sheet', function (t) {
  setup()

  var albumDir = join(basedir, 'The Beatles', 'Skiffle Rumble')
  mkdirp.sync(albumDir)
  writeFileSync(join(albumDir, '1-Savage_Beatings_for_All.flac'), 'lol')

  return readAlbums(basedir).then(function (albums) {
    t.equal(albums.size, 1)
    var albumPair = iteratorToArray(albums)[0]
    t.equal(albumPair[0], albumDir)
    var album = albumPair[1]
    t.ok(album, 'found album')
    t.equal(album.artist.name, 'The Beatles', "name didn't change")
    t.equal(album.name, 'Skiffle Rumble', "name didn't change")
    t.equal(album.tracks.length, 1, 'found single expected track')
    var track = album.tracks[0]
    t.equal(track.name, 'Savage Beatings for All', 'track name normalized')
    t.equal(track.index, 1, 'track index parsed from filename')
  })
})

test('read root with one one-track directory, with cue sheet', function (t) {
  setup()

  var artistDir = join(basedir, 'The Beatles')
  mkdirp.sync(artistDir)
  writeFileSync(join(artistDir, 'Skiffle_Rumble.flac'), 'lol')

  var cuesheet = join(artistDir, 'Skiffle_Rumble.cue')
  writeFileSync(cuesheet, 'rofl')

  return readAlbums(basedir).then(function (albums) {
    t.equal(albums.size, 1)
    var albumPair = iteratorToArray(albums)[0]
    t.equal(albumPair[0], artistDir)
    var album = albumPair[1]
    t.ok(album, 'found album')
    t.equal(album.name, 'Skiffle_Rumble', "name didn't change")

    t.equal(album.cuesheet.path, cuesheet, 'found cue sheet')
  })
})

test('cleanup', function (t) {
  cleanup()
  t.end()
})
