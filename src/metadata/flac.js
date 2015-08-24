require('es6-shim')

const Promise = require('bluebird')
const promisify = Promise.promisify

const {basename, dirname} = require('path')
const createReadStream = require('fs').createReadStream
const stat = promisify(require('fs').stat)

const FLAC = require('flac-parser')
const log = require('npmlog')

import Album from '../models/album-multi.js'
import AudioFile from '../models/audio-file.js'
import Track from '../models/track.js'

function scan (path, trackers, extras = {}) {
  log.verbose('flac.scan', 'scanning', path)

  return stat(path).then(stats => new Promise((resolve, reject) => {
    const name = basename(path)
    let tracker = trackers.get(name)
    if (!tracker) {
      tracker = log.newGroup(name)
      trackers.set(name, tracker)
    }

    const streamData = {}
    const flacTags = extras.flacTags = {}
    const musicbrainzTags = extras.musicbrainzTags = {}

    createReadStream(path)
      .pipe(tracker.newStream('FLAC scan: ' + name, stats.size))
      .pipe(new FLAC())
      .on('data', d => {
        if (d.type.match(/^MUSICBRAINZ_/)) {
          musicbrainzTags[d.type] = d.value
        } else if (d.type.match(/[a-z]/)) {
          streamData[d.type] = d.value
        } else {
          flacTags[d.type] = d.value
        }
      })
      .on('error', reject)
      .on('finish', () => {
        extras.file = new AudioFile(path, stats, streamData)

        if (streamData.duration) extras.duration = parseFloat(streamData.duration)

        if (flacTags.TRACKNUMBER) extras.index = parseInt(flacTags.TRACKNUMBER, 10)
        if (flacTags.DISCNUMBER) extras.disc = parseInt(flacTags.DISCNUMBER, 10)
        if (flacTags.DATE) extras.date = flacTags.DATE

        resolve(new Track(flacTags.ARTIST, flacTags.ALBUM, flacTags.TITLE, extras))
      })
  }))
}

function albumsFromTracks (metadata, covers) {
  const albums = new Map()
  const tracks = [].concat(...metadata)
  for (let track of tracks) {
    const tags = track.flacTags
    if (!albums.get(tags.ALBUM)) albums.set(tags.ALBUM, [])
    albums.get(tags.ALBUM).push(track)
  }

  const finished = new Set()
  for (let album of albums.keys()) {
    let artists = new Set()
    let tracks = new Set()
    let dirs = new Set()
    let archives = new Set()
    for (let track of albums.get(album)) {
      log.silly('albumsFromTracks', 'track', track)
      artists.add(track.flacTags.ARTIST)
      dirs.add(dirname(track.path))
      archives.add(track.sourceArchive.path)
      tracks.add(track)
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

function tracksIntoSets (tracks) {
  const trackSets = new Map()

  // 1. bundle the tracks into sets
  for (let track of tracks) {
    let key

    const albumArtist = track.fsAlbum.artist
    key = albumArtist + ' - ' + track.album
    if (!trackSets.get(key)) {
      log.verbose('artists', 'creating set for tracks on:', key)
      trackSets.set(key, new Set())
    }
    trackSets.get(key).add(track)
  }

  return trackSets
}

function trackSetsIntoAlbums (trackSets) {
  const albums = new Set()

  for (let trackSet of trackSets) {
    const tracks = [...trackSet]
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
  tracksIntoSets,
  trackSetsIntoAlbums
}
