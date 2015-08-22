const { basename, dirname, extname } = require('path')

import readTracks from './read-fs-tracks.js'

import Cover from './models/cover.js'
import Cuesheet from './models/cuesheet.js'
import Multitrack from './models/album-multi.js'
import Singletrack from './models/album-single.js'
import Track from './models/track.js'

function extractTypeFromTree (type, tree, visit) {
  for (let e of tree) {
    if (Array.isArray(e)) extractTypeFromTree(type, e, visit)
    else if (e instanceof type) visit(e)
  }
}

export default function readAlbums (root) {
  const cues = new Map()
  const covers = new Map()
  const albums = new Set()

  return readTracks(root).then(postprocess)

  function postprocess (tree) {
    extractTypeFromTree(
      Cover,
      tree,
      e => covers.set(basename(e.path, extname(e.path)), e)
    )
    extractTypeFromTree(
      Cuesheet,
      tree,
      e => cues.set(basename(e.path, extname(e.path)), e)
    )

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
        const base = basename(thing.path, extname(thing.path))
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
          console.error('whut', track)
        }
        continue
      }

      tracks.delete(track)
      artistNames.add(track.artist)
      albumNames.add(track.album)
      tracklisting.push(track)
    }

    if (tracks.size > 0) throw new Error(tracks.size + ' leftover tracks!')

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
      const album = new Multitrack(albumName, artistName, directory, tracklisting)
      album.pictures = album.pictures.concat([...pictures])
      albums.add(album)
    }

    return albums
  }
}
