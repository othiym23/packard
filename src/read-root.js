const Promise = require('bluebird')
const promisify = Promise.promisify

require('es6-shim')

const {basename, extname} = require('path')
const readdir = promisify(require('fs').readdir)
const stat = promisify(require('fs').stat)
const resolve = require('path').resolve

const log = require('npmlog')

const Artist = require('./models/artist.js')
const Cover = require('./models/cover.js')
const Multitrack = require('./models/album-multi.js')
const Singletrack = require('./models/album-single.js')
const Track = require('./models/track.js')

const cruft = [
  '.DS_Store',    // OS X metadata is very cluttery
  '.AppleDouble', // see above
  'Thumbs.db',    // yes, I do run Windows sometimes
  '.Parent'       // I have no idea
]

function visit (root) {
  return readdir(root)
           .filter(e => cruft.indexOf(e) === -1)
           .map(e => stat(resolve(root, e))
                       .then(stats => { return {path: e, stats} }))
}

function readRoot (root) {
  return visit(root).map(({path, stats}) => {
    if (stats.isDirectory()) return readArtist(root, path)

    log.warn('unexpected thing', path, 'in root', root)
  })
}

function flatten (root) {
  return readRoot(root).then(artists => {
    const tracks = new Set()
    for (let artist of artists)
      for (let album of artist.albums)
        for (let track of album.tracks)
          tracks.add({artist, album, track, stats: track.stats})

    return tracks
  })
}

function readArtist (root, directory) {
  const artistPath = resolve(root, directory)
  const cues = new Map()

  return visit(artistPath).map(({stats, path}) => {
    const currentPath = resolve(artistPath, path)
    if (stats.isDirectory()) {
      return readAlbum(root, directory, path)
    } else if (stats.isFile()) {
      const ext = extname(path)
      const base = basename(path, ext)
      switch (ext) {
        case '.flac':
        case '.mp3':
          return new Singletrack(
            path,
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
          log.warn('not sure what to do with', path)
      }
    } else {
      log.warn('rando in artist directory:', directory, path)
    }
  })
  .filter(Boolean)
  .then(albums => {
    for (let a of albums) {
      const p = a.path
      const ext = extname(p)
      const base = basename(p, ext)
      if (cues.get(base)) a.cuesheet = cues.get(base)
    }

    return new Artist(directory, [...albums])
  })
}

function readAlbum (root, artist, album) {
  const albumPath = resolve(root, artist, album)
  return visit(albumPath).map(({path, stats}) => {
    if (stats.isFile()) {
      const fullPath = resolve(albumPath, path)
      switch (extname(path)) {
        case '.flac':
        case '.mp3':
          const track = new Track(
            artist,
            album,
            path,
            fullPath,
            stats
          )
          track.ext = extname(path)
          return track
        case '.jpg':
        case '.pdf':
        case '.png':
          return new Cover(
            fullPath,
            stats
          )
        default:
          log.warn('unknown file type', path)
      }
    } else {
      log.warn('only was expecting file, but got', path)
    }
  })
  .then(files => {
    var tracks = files.filter(f => f instanceof Track)
    var covers = files.filter(f => f instanceof Cover)

    const a = new Multitrack(album, artist, albumPath, tracks)
    if (covers.length) a.pictures = covers

    return a
  })
}

readRoot.readRootFlat = flatten

module.exports = readRoot
// export default readRoot
