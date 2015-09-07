// oh iterables
import 'babel/polyfill'

import assert from 'assert'
import { dirname } from 'path'

import log from 'npmlog'

import { MultitrackAlbum as Album, Artist } from '@packard/model'

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

export default function albumsFromTracks (metadata, covers = new Map()) {
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
      log.silly('albumsFromTracks', 'track', track)
      names.add(track.flacTags.ALBUM)
      artists.add(track.flacTags.ALBUMARTIST || track.flacTags.ARTIST)
      dirs.add(dirname(track.file.path))
      dates.add(track.date)
      if (track.sourceArchive) archives.set(track.sourceArchive.path, track.sourceArchive)
      tracks.add(track)
    }

    const minNames = [...names]
    if (minNames.length === 0) log.error('albumsFromTracks', 'album has no name?', minNames)
    if (minNames.length > 1) {
      log.error('albumsFromTracks', 'album has more than one name', minNames)
    }

    const minDirs = [...dirs]
    if (minDirs.length === 0) log.warn('albumsFromTracks', 'album has no path?', minDirs)
    if (minDirs.length > 1) {
      log.warn('albumsFromTracks', 'album in more than one directory', minDirs)
    }

    const minDates = [...dates.keys()]
    if (minDates.length > 1) {
      log.warn('albumsFromTracks', 'more than one date', minDates)
    }

    const minArchism = [...archives.keys()]
    if (minArchism.length > 1) {
      log.warn('albumsFromTracks', 'more than one source archive', minArchism)
      log.warn('albumsFromTracks', '--archive may not work as expected')
    }

    let artistName
    const minArtists = [...artists]
    switch (minArtists.length) {
      case 1:
        artistName = minArtists[0]
        log.verbose('albumsFromTracks', '1 artist found', artistName)
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
        log.warn('albumsFromTracks', '2 artists found; assuming split', artistName)
        break
      default:
        log.warn('albumsFromTracks', 'many artists found; assuming compilation', minArtists)
        artistName = 'Various Artists'
    }
    const artist = new Artist(artistName)
    const a = new Album(minNames[0], artist, { path: minDirs[0], tracks: [...tracks] })
    a.sourceArchive = archives.get(minArchism[0])
    a.date = minDates[0]
    log.verbose('albumsFromTracks', 'looking up cover for', a.path, minDirs)
    if (covers.get(a.path)) a.pictures = covers.get(a.path)
    for (let track of tracks) {
      track.album = a
    }
    log.silly('albumsFromTracks', 'finished album', a)
    finished.add(a)
  }

  log.verbose('albumsFromTracks', 'processed', finished.size, 'albums')
  return finished
}
