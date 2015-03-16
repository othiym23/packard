require('es6-shim')

const Promise = require('bluebird')
const promisify = Promise.promisify

const {basename, dirname} = require('path')
const createReadStream = require('fs').createReadStream
const stat = promisify(require('fs').stat)

const FLAC = require('flac-parser')
const log = require('npmlog')

const audit = require('./audit.js')
const Album = require('../models/album-multi.js')
const Track = require('../models/track.js')

function scan (bundle, groups) {
  const path = bundle.path
  log.verbose('flac.scan', 'scanning', path)

  const metadata = {}
  bundle.metadata = metadata

  return stat(path).then(stats => new Promise((resolve, reject) => {
    bundle.stats = stats
    const tracker = groups.get(basename(path)).newStream(
      'FLAC scan: ' + basename(path),
      stats.size
    )
    createReadStream(path)
      .pipe(tracker)
      .pipe(new FLAC())
      .on('data', d => metadata[d.type] = d.value)
      .on('error', reject)
      .on('finish', () => resolve(bundle))
  }))
}

function albumsFromTracks (metadata, covers) {
  const albums = new Map()
  const tracks = [].concat(...metadata)
  for (let track of tracks) {
    if (!albums.get(track.metadata.ALBUM)) albums.set(track.metadata.ALBUM, [])
    albums.get(track.metadata.ALBUM).push(track)
  }

  const finished = new Set()
  for (let album of albums.keys()) {
    let artists = new Set()
    let tracks = new Set()
    let dirs = new Set()
    let archives = new Set()
    for (let track of albums.get(album)) {
      log.silly('albumsFromTracks', 'track', track)
      artists.add(track.metadata.ARTIST)
      dirs.add(dirname(track.path))
      archives.add(track.sourceArchive)
      tracks.add(Track.fromFLAC(track.metadata, track.path, track.stats))
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

function fsEntitiesIntoBundles ({artist, album, track}, groups) {
  groups.set(track.name, log.newGroup('read: ' + track.path))

  return scan(track, groups)
    .then(b => {
      b.fsArtist = artist
      b.fsAlbum = album
      b.fsTrack = track
      b.flacTrack = Track.fromFLAC(b.metadata, b.path, b.stats)

      log.silly('fsEntitiesIntoBundles', 'bundle', b)
      return b
    })
    .then(audit)
}

function bundlesIntoTrackSets (bundles) {
  const trackSets = new Map()

  // 1. bundle the tracks into sets
  for (let bundle of bundles) {
    let key

    const albumArtist = bundle.fsAlbum.artist
    key = albumArtist + ' - ' + bundle.flacTrack.album
    if (!trackSets.get(key)) {
      log.verbose('artists', 'creating set for tracks on:', key)
      trackSets.set(key, new Set())
    }
    const trackSet = trackSets.get(key)
    bundle.trackSet = trackSet
    trackSet.add(bundle)
  }

  return trackSets
}

function trackSetsIntoAlbums (trackSets) {
  const albums = new Set()

  for (let trackSet of trackSets) {
    const tracks = [...trackSet].map(t => t.flacTrack)
    const sorted = tracks.sort((a, b) => a.index - b.index)

    const albumArtists = [...trackSet].reduce((s, b) => s.add(b.fsAlbum.artist), new Set())
    if (albumArtists.size > 1) {
      log.warn('artists', 'many artists found', [...albumArtists])
    }

    const dates = tracks.reduce((s, t) => s.add(t.date), new Set())
    if (dates.size > 1) {
      log.warn('artists', 'many dates found', [...dates])
    }

    const names = tracks.reduce((s, t) => s.add(t.album), new Set())
    if (dates.size > 1) {
      log.warn('artists', 'many album names found', [...names])
    }

    const album = new Album([...names][0], [...albumArtists][0], '-', sorted)
    album.date = [...dates][0]
    albums.add(album)
  }

  return albums
}

module.exports = {
  scan,
  albumsFromTracks,
  bundlesIntoTrackSets,
  fsEntitiesIntoBundles,
  trackSetsIntoAlbums
}
