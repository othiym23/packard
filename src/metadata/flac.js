const promisify = require('es6-promisify')

const {basename, dirname} = require('path')
const createReadStream = require('fs').createReadStream
const stat = promisify(require('fs').stat)

const FLAC = require('flac-parser')
const log = require('npmlog')

const Album = require('../models/album-multi.js')
const Track = require('../models/track.js')
const trackers = require('../trackers.js')

function scan (sourceArchive, filename) {
  log.verbose('readMetadata', 'scanning', filename, 'source archive', sourceArchive)
  return stat(filename).then(stats => new Promise((resolve, reject) => {
    const tag = {filename, stats}
    const tracker = trackers.get(sourceArchive).newStream(
      'metadata: ' + basename(filename),
      stats.size
    )
    createReadStream(filename)
      .pipe(tracker)
      .pipe(new FLAC())
      .on('data', d => tag[d.type] = d.value)
      .on('error', reject)
      .on('finish', () => resolve(tag))
  }))
}

function albumsFromTracks (metadata) {
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
    for (let track of albums.get(album)) {
      log.silly('makeAlbums', 'track', track)
      artists.add(track.ARTIST)
      dirs.add(dirname(track.filename))
      tracks.add(Track.fromFLAC(track))
    }

    const minArtists = Array.from(artists.values())
    const minDirs = Array.from(dirs.values())
    if (minDirs.length > 1) log.warn('makeAlbums', 'minDirs too big', minDirs)

    let artist
    switch (minArtists.length) {
      case 1:
        artist = minArtists[0]
        break
      case 2:
        log.warn('makeAlbums', '2 artists found; assuming split', minArtists)
        let [first, second] = minArtists
        if (first.indexOf(second) !== -1) {
          artist = first
        } else if (second.indexOf(first) !== -1) {
          artist = second
        } else {
          const sorted = Array.from(tracks.values()).sort((a, b) => (a.index || 0) - (b.index || 0))
          if (sorted[0].artist === first) {
            artist = first + ' / ' + second
          } else {
            artist = second + ' / ' + first
          }
        }
        break
      default:
        log.warn('makeAlbums', 'many artists found; assuming compilation', minArtists)
        artist = 'Various Artists'
    }
    finished.add(new Album(album, artist, minDirs[0], Array.from(tracks.values())))
  }

  for (let album of finished.values()) {
    console.log(album.dump())
  }

  return finished
}

module.exports = { scan, albumsFromTracks }
