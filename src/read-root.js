/*eslint-disable no-undef*/ // oh eslint
const Promise = require('bluebird')
/*eslint-enable no-undef*/

const promisify = Promise.promisify

require('es6-shim')

const {basename, extname} = require('path')
const readdir = promisify(require('fs').readdir)
const stat = promisify(require('fs').stat)
const resolve = require('path').resolve

const Artist = require('./models/artist.js')
const Cover = require('./models/cover.js')
const Multitrack = require('./models/album-multi.js')
const Singletrack = require('./models/album-single.js')
const Track = require('./models/track.js')

const cruft = [
  '.DS_Store', // OS X metadata is very cluttery
  'Thumbs.db'  // yes, I do run Windows sometimes
]

function isThing (thing) { return thing }

function visit (root, visitor) {
  return readdir(root).then(entries => Promise.all(
    entries
      .filter(e => cruft.indexOf(e) === -1)
      .map(entry => stat(resolve(root, entry)).then(visitor(entry)))
  ))
}

function readRoot (root) {
  return visit(root, withStatsReadArtist)

  function withStatsReadArtist (entry) {
    return function selectArtist (stats) {
      if (stats.isDirectory()) return readArtist(root, entry)

      console.log('WARN: unexpected thing', entry, 'in root', root)
    }
  }
}

function readArtist (root, directory) {
  const artistPath = resolve(root, directory)
  const cues = new Map()

  return visit(artistPath, withStatsReadAlbum).then(albums => {
    for (let a of albums.filter(isThing)) {
      const p = a.path
      const ext = extname(p)
      const base = basename(p, ext)
      if (cues.get(base)) a.cuesheet = cues.get(base)
    }

    return new Artist(directory, albums.filter(isThing))
  })

  function withStatsReadAlbum (entry) {
    const currentPath = resolve(artistPath, entry)
    return function selectAlbum (stats) {
      if (stats.isDirectory()) {
        return readAlbum(root, directory, entry)
      } else if (stats.isFile()) {
        const ext = extname(entry)
        const base = basename(entry, ext)
        switch (ext) {
          case '.flac':
          case '.mp3':
            return new Singletrack(
              entry,
              directory,
              currentPath,
              stats
            )
          case '.cue':
            cues.set(base, currentPath)
            break
          case '.log':
            // nothing to do with these
            break
          default:
            console.log('not sure what to do with', entry)
        }
      } else {
        console.log('rando in artist directory:', directory, entry)
      }
    }
  }
}

function readAlbum (root, artist, album) {
  const albumPath = resolve(root, artist, album)
  return visit(albumPath, withStatsReadFiles).then(files => {
    var tracks = files.filter(f => f instanceof Track)
    var covers = files.filter(f => f instanceof Cover)

    const a = new Multitrack(album, artist, albumPath, tracks)
    if (covers.length) a.pictures = covers

    return a
  })

  function withStatsReadFiles (entry) {
    return function selectFiles (stats) {
      if (stats.isFile()) {
        switch (extname(entry)) {
          case '.flac':
          case '.mp3':
            return new Track(
              artist,
              album,
              entry,
              stats
            )
          case '.jpg':
          case '.pdf':
          case '.png':
            return new Cover(
              resolve(albumPath, entry),
              stats
            )
          default:
            console.log('Unknown file type', entry)
        }
      } else {
        console.log('Only was expecting file, but got', entry)
      }
    }
  }
}

module.exports = readRoot
// export default readRoot
