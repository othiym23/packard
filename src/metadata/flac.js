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
        tracker.verbose('flac.scan', 'finished scanning', path)
        extras.file = new AudioFile(path, stats, streamData)

        if (streamData.duration) extras.duration = parseFloat(streamData.duration)

        if (flacTags.TRACKNUMBER) extras.index = parseInt(flacTags.TRACKNUMBER, 10)
        if (flacTags.DISCNUMBER) extras.disc = parseInt(flacTags.DISCNUMBER, 10)
        if (flacTags.DATE) extras.date = flacTags.DATE

        resolve(new Track(flacTags.ARTIST, flacTags.ALBUM, flacTags.TITLE, extras))
      })
  }))
}

function albumsFromMetadata (metadata, covers) {
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
      log.silly('albumsFromMetadata', 'track', track)
      artists.add(track.flacTags.ARTIST)
      dirs.add(dirname(track.path))
      archives.add(track.sourceArchive.path)
      tracks.add(track)
    }

    const minDirs = [...dirs]
    if (minDirs.length === 0) log.warn('albumsFromMetadata', 'minDirs too small', minDirs)
    if (minDirs.length > 1) log.warn('albumsFromMetadata', 'minDirs too big', minDirs)

    const minArchism = [...archives]
    if (minArchism.length > 1) {
      log.warn('albumsFromMetadata', 'more than one source archive', minArchism)
      log.warn('albumsFromMetadata', '--archive may not work as expected')
    }

    let artist
    const minArtists = [...artists]
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
        log.warn('albumsFromMetadata', '2 artists found; assuming split', artist)
        break
      default:
        log.warn('albumsFromMetadata', 'many artists found; assuming compilation', minArtists)
        artist = 'Various Artists'
    }
    const a = new Album(album, artist, minDirs[0], [...tracks])
    a.sourceArchive = minArchism[0]
    log.verbose('albumsFromMetadata', 'looking up cover for', a.path, minDirs)
    if (covers.get(a.path)) a.pictures = covers.get(a.path)
    finished.add(a)
  }

  log.verbose('albumsFromMetadata', 'processed', finished.size, 'albums')
  return finished
}

function albumsFromFS (tracks) {
  const albums = new Set()

  // 1: map heuristic ID to sets of tracks that are probably albums
  const maybeAlbums = new Map()
  for (let track of tracks) {
    const id = track.fsAlbum.artist + ' - ' + track.album
    if (!maybeAlbums.get(id)) {
      log.verbose('albumsFromFS', 'creating set for tracks on:', id)
      maybeAlbums.set(id, new Set())
    }
    maybeAlbums.get(id).add(track)
  }

  // 2: take educated guesses at what the album-level metadata is
  for (let trackSet of maybeAlbums.values()) {
    const sorted = [...trackSet].sort((a, b) => a.index - b.index)

    const albumArtists = sorted.reduce((s, t) => s.add(t.fsAlbum.artist), new Set())
    if (albumArtists.size > 1) {
      log.warn('albumsFromFS', 'many artists found', [...albumArtists])
    }

    const dates = sorted.reduce((s, t) => s.add(t.date), new Set())
    if (dates.size > 1) {
      log.warn('albumsFromFS', 'many dates found', [...dates])
    }

    const names = sorted.reduce((s, t) => s.add(t.album), new Set())
    if (dates.size > 1) {
      log.warn('albumsFromFS', 'many album names found', [...names])
    }

    const album = new Album([...names][0], [...albumArtists][0], '-', sorted)
    album.date = [...dates][0]
    albums.add(album)
  }

  return albums
}

module.exports = {
  scan,
  albumsFromMetadata,
  albumsFromFS
}
