import { basename, dirname, extname, join } from 'path'

import validate from 'aproba'
import log from 'npmlog'

import findTypes from '../utils/find-types.js'
import readModels from './read-models.js'

import { SingletrackAlbum as Singletrack } from '@packard/model'

// at the metadata level, albums are grouped by folder
// TODO: heuristics that look at directory name
export function toBaseAlbumLocation (path) {
  validate('S', arguments)
  return dirname(path)
}

// cuesheets have the same base name as the file to which they're attached
export function toBaseTrackName (path) {
  validate('S', arguments)
  return join(dirname(path), basename(path, extname(path)))
}

export function remapCovers (set) {
  validate('O', arguments)

  const covers = new Map()
  for (let info of set) {
    const directory = toBaseAlbumLocation(info.path)
    if (!covers.get(directory)) {
      log.silly('remapCovers', 'creating cover list for', directory)
      covers.set(directory, new Set())
    }
    log.silly('remapCovers', 'cover at', info.path)
    covers.get(directory).add(info.cover)
  }

  return covers
}

export function remapCuesheets (set) {
  validate('O', arguments)

  const cuesheets = new Map()
  for (let info of set) {
    const base = toBaseTrackName(info.path)
    if (cuesheets.get(base)) {
      log.warn('remapCuesheets', base, 'already has cue sheet; overwriting with newer')
    }
    cuesheets.set(base, info.cuesheet)
  }
  return cuesheets
}

export function tracksToAlbums (tracks, cuesheets) {
  validate('OO', arguments)

  const albums = new Map()

  for (let track of tracks) {
    if (!(track.fsTrack && track.fsAlbum)) {
      throw new TypeError('must have fsTracks to attach to fsAlbums')
    }
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

export function attachCoversToAlbums (albums, covers) {
  validate('OO', arguments)

  // probably fewer directories with covers than albums
  for (let [albumPath, coverSet] of covers) {
    if (albums.get(albumPath)) {
      const album = albums.get(albumPath)
      album.pictures = album.pictures.concat([...coverSet])
    }
  }

  return albums
}

export function albumsFromMetadata (metadata) {
  validate('O', arguments)

  const foundMap = findTypes(metadata, ['cover', 'cuesheet', 'fsTrack'])

  const tracks = foundMap.get('fsTrack')
  const cuesheets = remapCuesheets(foundMap.get('cuesheet'))
  const albums = tracksToAlbums(tracks, cuesheets)

  const covers = remapCovers(foundMap.get('cover'))
  return attachCoversToAlbums(albums, covers)
}

export default function readAlbums (root) {
  return readModels(root).then(albumsFromMetadata)
}
