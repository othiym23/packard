import { basename, dirname, extname } from 'path'

import log from 'npmlog'

import findTypes from '../utils/find-types.js'
import readModels from './read-models.js'

import { SingletrackAlbum as Singletrack } from '@packard/model'

function remapCovers (set) {
  const covers = new Map()
  for (let info of set) {
    const directory = toBaseAlbumLocation(info.path)
    if (!covers.get(directory)) {
      log.silly('remapCovers', 'creating cover list for', directory)
      covers.set(directory, new Set())
    }
    log.silly('remapCovers', 'cover at', info.path)
    covers.get(directory).push(info.cover)
  }

  return covers
}

function remapCuesheets (set) {
  const cuesheets = new Map()
  for (let info of set) {
    const base = toBaseTrackName(info.path)
    cuesheets.set(base, info.cuesheet)
  }
  return cuesheets
}

// at the metadata level, albums are grouped by folder
// TODO: heuristics that look at directory name
function toBaseAlbumLocation (path) {
  return dirname(path)
}

// cuesheets have the same base name as the file to which they're attached
// TODO: restrict this to the same path
function toBaseTrackName (path) {
  return basename(path, extname(path))
}

function tracksToAlbums (tracks, cuesheets) {
  const albums = new Map()

  for (let track of tracks) {
    const base = toBaseTrackName(track.path)
    const albumPath = toBaseAlbumLocation(track.path)

    if (cuesheets.get(base)) {
      const album = Singletrack.fromTrack(track.fsTrack)
      album.cuesheet = cuesheets.get(base)
      albums.set(albumPath, album)
    } else {
      if (!albums.get(albumPath)) {
        albums.set(albumPath, track.fsAlbum)
      }

      albums.get(albumPath).tracks.push(track.fsTrack)
    }
  }

  return albums
}

function attachCoversToAlbums (albums, covers) {
  // probably fewer directories with covers than albums
  for (let [albumPath, coverSet] of covers) {
    if (albums.get(albumPath)) {
      const album = albums.get(albumPath)
      album.pictures = album.pictures.concat([...coverSet])
    }
  }

  return albums
}

function albumsFromMetadata (metadata) {
  const foundMap = findTypes(metadata, ['cover', 'cuesheet', 'fsTrack'])

  const tracks = foundMap.get('fsTrack')
  const cuesheets = remapCuesheets(foundMap.get('cuesheet'))
  const albums = tracksToAlbums(tracks, cuesheets)

  const covers = remapCovers(foundMap.get('cover'))
  return attachCoversToAlbums(albums, covers)
}

export function readAlbums (root) {
  return readModels(root).then(albumsFromMetadata)
}

export function readArtists (root) {
  return readAlbums(root).then((albums) => {
    const artists = new Map()

    for (let album of albums.values()) {
      let artist = artists.get(album.artist.name)
      if (!artist) {
        artist = album.artist
        artists.set(album.artist.name, artist)
      }

      artist.albums.push(album)
    }

    return artists.values()
  })
}
