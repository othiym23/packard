/*eslint-disable no-undef*/ // oh eslint
const Promise = require('bluebird')
/*eslint-enable no-undef*/

const promisify = Promise.promisify

const {basename, dirname} = require('path')
const createReadStream = require('fs').createReadStream
const stat = promisify(require('fs').stat)

const FLAC = require('flac-parser')
const log = require('npmlog')

const Album = require('../models/album-multi.js')
const Track = require('../models/track.js')

function scan (path, groups) {
  log.verbose('flac.scan', 'scanning', path)

  const metadata = {}
  return stat(path).then(stats => new Promise((resolve, reject) => {
    const tracker = groups.get(basename(path)).newStream(
      'FLAC scan: ' + basename(path),
      stats.size
    )
    createReadStream(path)
      .pipe(tracker)
      .pipe(new FLAC())
      .on('data', d => metadata[d.type] = d.value)
      .on('error', reject)
      .on('finish', () => resolve({ path, stats, metadata }))
  }))
}

function albumsFromTracks (metadata, covers) {
  const albums = new Map()
  const tracks = [].concat(...metadata)
  for (let track of tracks) {
    if (!albums.get(track.ALBUM)) albums.set(track.ALBUM, [])
    albums.get(track.ALBUM).push(track)
  }

  const finished = new Set()
  for (let album of albums.keys()) {
    let artists = new Set()
    let tracks = new Set()
    let dirs = new Set()
    let archives = new Set()
    for (let track of albums.get(album)) {
      log.silly('makeAlbums', 'track', track)
      artists.add(track.ARTIST)
      dirs.add(dirname(track.fullPath))
      archives.add(track.sourceArchive)
      tracks.add(Track.fromFLAC(track))
    }

    const minArtists = [...artists]
    const minDirs = [...dirs]
    const minArchism = [...archives]
    if (minDirs.length === 0) log.warn('makeAlbums', 'minDirs too small', minDirs)
    if (minDirs.length > 1) log.warn('makeAlbums', 'minDirs too big', minDirs)
    if (minArchism.length > 1) {
      log.warn('makeAlbums', 'more than one source archive', minArchism)
      log.warn('makeAlbums', '--archive may not work as expected')
    }

    let artist
    switch (minArtists.length) {
      case 1:
        artist = minArtists[0]
        break
      case 2:
        let [first, second] = minArtists
        if (first.indexOf(second) !== -1) {
          artist = first
        } else if (second.indexOf(first) !== -1) {
          artist = second
        } else {
          const sorted = [...tracks].sort((a, b) => (a.index || 0) - (b.index || 0))
          if (sorted[0].artist === first) {
            artist = first + ' / ' + second
          } else {
            artist = second + ' / ' + first
          }
        }
        log.warn('makeAlbums', '2 artists found; assuming split', artist)
        break
      default:
        log.warn('makeAlbums', 'many artists found; assuming compilation', minArtists)
        artist = 'Various Artists'
    }
    const a = new Album(album, artist, minDirs[0], [...tracks])
    a.sourceArchive = minArchism[0]
    log.verbose('makeAlbums', 'looking up cover for', a.path, minDirs)
    if (covers.get(a.path)) a.pictures = covers.get(a.path)
    finished.add(a)
  }

  log.verbose('makeAlbums', 'processed', finished.size, 'albums')
  return finished
}

module.exports = { scan, albumsFromTracks }
