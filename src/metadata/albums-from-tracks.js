// oh iterables
import 'babel-polyfill'

import assert from 'assert'
import { dirname } from 'path'

import log from 'npmlog'

import { MultitrackAlbum as Album, Artist, Cover } from '@packard/model'

// heuristic as all get-out
function getID ({ fsAlbum, tags, album }) {
  if (tags && tags.albumArtist && tags.album) {
    return tags.albumArtist + ' - ' + tags.album
  } else if (fsAlbum && fsAlbum.artist && fsAlbum.artist.name && album) {
    return fsAlbum.artist.name + ' - ' + album.name
  } else if (album && album.name) {
    return album.name
  }
}

function findCovers (list) {
  const covers = new Map()
  list.filter(e => e instanceof Cover)
      .forEach(c => {
        const directory = dirname(c.path)
        if (!covers.get(directory)) {
          log.silly('populateImages', 'creating image list for', directory)
          covers.set(directory, [])
        }
        log.silly('populateImages', 'cover', c)
        covers.get(directory).push(c)
      })

  return covers
}

export default function albumsFromTracks (metadata) {
  assert(metadata, 'must pass metadata')

  metadata = [].concat(...metadata)
  const albums = new Map()
  const tracks = metadata.filter(getID)
  const covers = findCovers(metadata)
  log.silly('albumsFromTracks', tracks.length, 'tracks')
  for (let track of tracks) {
    const id = getID(track)
    if (!albums.get(id)) albums.set(id, [])
    albums.get(id).push(track)
  }

  const finished = new Set()
  log.verbose('albumsFromTracks', [...albums.keys()].length, 'albums', [...albums.keys()])
  for (let album of albums.keys()) {
    let names = new Set()
    let artists = new Set()
    let tracks = new Set()
    let dirs = new Set()
    let dates = new Set()
    let archives = new Map()

    for (let track of albums.get(album)) {
      if (!track.album) continue
      if (track.album) names.add(track.album.name)
      if (track.album.artist) {
        artists.add(track.album.artist.name)
      } else if (track.artist) {
        artists.add(track.artist.name)
      }
      dirs.add(dirname(track.file.path))
      dates.add(track.date)
      if (track.sourceArchive) archives.set(track.sourceArchive.path, track.sourceArchive)
      tracks.add(track)
    }

    const minNames = [...names]
    if (minNames.length === 0) log.error('albumsFromTracks', 'album has no name?', names)
    if (minNames.length > 1) {
      log.error('albumsFromTracks', 'album has more than one name', minNames)
    }

    const minDirs = [...dirs]
    if (minDirs.length === 0) log.warn('albumsFromTracks', 'album has no path?', dirs)
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
      case 0:
        log.error('albumsFromTracks', 'album has no artists?', artists)
        break
      case 1:
        artistName = minArtists[0]
        log.verbose('albumsFromTracks', '1 artist found:', artistName)
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
