// oh iterables
import 'es6-shim'

import fs from 'graceful-fs'
import assert from 'assert'
import { basename, dirname } from 'path'
import { createReadStream } from 'graceful-fs'

import Promise from 'bluebird'
import { promisify } from 'bluebird'

import FLACReader from 'flac-parser'
import log from 'npmlog'

import Album from '../models/album-multi.js'
import Artist from '../models/artist.js'
import AudioFile from '../models/audio-file.js'
import Track from '../models/track.js'

const stat = promisify(fs.stat)

export function scan (path, trackers, extras = {}) {
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
      .pipe(new FLACReader())
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

        const artist = new Artist(flacTags.ARTIST)
        const album = new Album(flacTags.ALBUM, artist)
        resolve(new Track(artist, album, flacTags.TITLE, extras))
      })
  }))
}

// heuristic as all get-out
function getID ({ fsAlbum, flacTags, album }) {
  if (flacTags && flacTags.ALBUMARTIST && flacTags.ALBUM) {
    return flacTags.ALBUMARTIST + ' - ' + flacTags.ALBUM
  } else if (fsAlbum && fsAlbum.artist && fsAlbum.artist.name && album) {
    return fsAlbum.artist.name + ' - ' + album.name
  } else {
    return album && album.name
  }
}

export function albumsFromMetadata (metadata, covers = new Map()) {
  assert(metadata, 'must pass metadata')

  const albums = new Map()
  const tracks = [].concat(...metadata)
  for (let track of tracks) {
    const id = getID(track)
    if (!albums.get(id)) albums.set(id, [])
    albums.get(id).push(track)
  }

  const finished = new Set()
  for (let album of albums.keys()) {
    let names = new Set()
    let artists = new Set()
    let tracks = new Set()
    let dirs = new Set()
    let dates = new Set()
    let archives = new Map()

    for (let track of albums.get(album)) {
      log.silly('albumsFromMetadata', 'track', track)
      names.add(track.flacTags.ALBUM)
      artists.add(track.flacTags.ALBUMARTIST || track.flacTags.ARTIST)
      dirs.add(dirname(track.file.path))
      dates.add(track.date)
      if (track.sourceArchive) archives.set(track.sourceArchive.path, track.sourceArchive)
      tracks.add(track)
    }

    const minNames = [...names]
    if (minNames.length === 0) log.error('albumsFromMetadata', 'album has no name?', minNames)
    if (minNames.length > 1) {
      log.error('albumsFromMetadata', 'album has more than one name', minNames)
    }

    const minDirs = [...dirs]
    if (minDirs.length === 0) log.warn('albumsFromMetadata', 'album has no path?', minDirs)
    if (minDirs.length > 1) {
      log.warn('albumsFromMetadata', 'album in more than one directory', minDirs)
    }

    const minDates = [...dates.keys()]
    if (minDates.length > 1) {
      log.warn('albumsFromMetadata', 'more than one date', minDates)
    }

    const minArchism = [...archives.keys()]
    if (minArchism.length > 1) {
      log.warn('albumsFromMetadata', 'more than one source archive', minArchism)
      log.warn('albumsFromMetadata', '--archive may not work as expected')
    }

    let artistName
    const minArtists = [...artists]
    switch (minArtists.length) {
      case 1:
        artistName = minArtists[0]
        break
      case 2:
        let [first, second] = minArtists
        if (first.indexOf(second) !== -1) {
          artistName = first
        } else if (second.indexOf(first) !== -1) {
          artistName = second
        } else {
          const sorted = [...tracks].sort((a, b) => (a.index || 0) - (b.index || 0))
          if (sorted[0].artistName === first) {
            artistName = first + ' / ' + second
          } else {
            artistName = second + ' / ' + first
          }
        }
        log.warn('albumsFromMetadata', '2 artists found; assuming split', artistName)
        break
      default:
        log.warn('albumsFromMetadata', 'many artists found; assuming compilation', minArtists)
        artistName = 'Various Artists'
    }
    const artist = new Artist(artistName)
    const a = new Album(minNames[0], artist, minDirs[0], [...tracks])
    a.sourceArchive = archives.get(minArchism[0])
    a.date = minDates[0]
    log.verbose('albumsFromMetadata', 'looking up cover for', a.path, minDirs)
    if (covers.get(a.path)) a.pictures = covers.get(a.path)
    for (let track of tracks) {
      track.album = a
    }
    finished.add(a)
  }

  log.verbose('albumsFromMetadata', 'processed', finished.size, 'albums')
  return finished
}
