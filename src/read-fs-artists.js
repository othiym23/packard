import { basename, dirname, extname } from 'path'

import log from 'npmlog'

import isCruft from './utils/cruft.js'
import toModel from './path-to-model.js'
import traverse from './utils/fs-traverse.js'

import {
  Artist,
  Cover,
  Cuesheet,
  MultitrackAlbum as Multitrack,
  SingletrackAlbum as Singletrack,
  Track
} from '@packard/model'

export function flatten (artists) {
  const info = new Set()
  for (let fsArtist of artists) {
    for (let fsAlbum of fsArtist.albums) {
      for (let fsTrack of (fsAlbum.tracks || [])) {
        info.add({ fsArtist, fsAlbum, fsTrack, path: fsTrack.file.path })
      }
    }
  }

  return info
}

function extractTypeFromTree (type, tree, visit) {
  for (let e of tree) {
    if (Array.isArray(e)) extractTypeFromTree(type, e, visit)
    else if (e instanceof type) visit(e)
  }
}

function readAlbums (root) {
  const cues = new Map()
  const covers = new Map()
  const albums = new Set()

  return traverse(root, isCruft, toModel).then(postprocess)

  function postprocess (tree) {
    if (!Array.isArray(tree)) tree = [tree]
    log.silly('readAlbums', 'tree', tree)
    extractTypeFromTree(
      Cover,
      tree,
      (e) => covers.set(basename(e.path, extname(e.path)), e)
    )
    log.silly('readAlbums', 'covers', covers)
    extractTypeFromTree(
      Cuesheet,
      tree,
      (e) => cues.set(basename(e.path, extname(e.path)), e)
    )
    log.silly('readAlbums', 'cuesheets', cues)

    return simplify(tree)
  }

  function simplify (tree) {
    return makeAlbum(filterMixes(tree))
  }

  function filterMixes (tree) {
    const remaining = new Set(tree)
    for (let thing of tree) {
      if (Array.isArray(thing)) {
        remaining.delete(thing)
        simplify(thing)
      } else if (thing instanceof Track) {
        const base = basename(thing.file.path, extname(thing.file.path))
        if (cues.get(base) || covers.get(base)) {
          remaining.delete(thing)
          const mix = Singletrack.fromTrack(thing)
          albums.add(mix)

          const cuesheet = cues.get(base)
          if (cuesheet) {
            remaining.delete(cuesheet)
            mix.cuesheet = cuesheet.path
          }

          const cover = covers.get(base)
          if (cover) {
            remaining.delete(cover)
            mix.pictures.push(cover)
          }
        }
      }
    }
    return remaining
  }

  function makeAlbum (tracks) {
    const artistNames = new Set()
    const albumNames = new Set()
    const pictures = new Set()
    const tracklisting = []

    for (let track of tracks) {
      if (!(track instanceof Track)) {
        if (track instanceof Cover) {
          tracks.delete(track)
          pictures.add(track)
        } else {
          log.warn('makeAlbum', 'unknown file found', track)
        }
        continue
      }

      tracks.delete(track)
      artistNames.add(track.artist.name)
      albumNames.add(track.album.name)
      tracklisting.push(track)
    }

    if (tracks.size > 0) {
      log.warn(
        'makeAlbum',
        tracks.size + ' leftover tracks after assembling album!'
      )
    }

    if (tracklisting.length > 0) {
      if (albumNames.size > 1) throw new Error('too many album names!')

      let artistName
      if (artistNames.size > 1) {
        artistName = 'Various Artists'
      } else {
        artistName = [...artistNames][0]
      }
      const albumName = [...albumNames][0]
      const directory = dirname(tracklisting[0].path)
      const artist = new Artist(artistName)
      const album = new Multitrack(
        albumName,
        artist,
        {
          path: directory,
          tracks: tracklisting
        }
      )
      album.pictures = album.pictures.concat([...pictures])
      albums.add(album)
    }

    return albums
  }
}

export function readArtists (root) {
  return readAlbums(root).then((albums) => {
    const artists = new Map()

    for (let album of albums) {
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

export default function readFSMetadata (root) {
  return readArtists(root).then(flatten)
}
