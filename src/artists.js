const log = require('npmlog')
const Promise = require('bluebird')

const flac = require('./metadata/flac.js')
const readTree = require('./read-tree.js')
const flatten = require('./flatten-tracks.js')
const Artist = require('./models/artist.js')

import audit from './metadata/audit.js'

function bySizeReverse (a, b) {
  return b.getSize() - a.getSize()
}

function safe (string) {
  return string.replace(/[^ \]\[A-Za-z0-9-]/g, '')
}

function scanArtists (roots, trackers) {
  return Promise.map(
      roots,
      root => readTree(root).then(artists => [root, flatten(artists)])
    ).map(([root, entities]) => {
      log.verbose('scanArtists', 'processing', root)
      return Promise.map(
          [...entities],
          entity => flac.scan(entity.path, trackers, entity).then(audit),
          { concurrency: 4 }
        ).then(tracks => {
          // 1. convert tracks into albums
          const albums = flac.albumsFromFS(tracks)

          // 2. find artist tracks that aren't on single-artist albums
          const artistTracks = albumsIntoArtistTracks(albums)

          // 3. roll up albums to artists
          // 4. add loose tracks to artists
          const artists = albumsAndTracksToArtists(albums, artistTracks)

          // 5. compile list per-artist
          const sorted = [...artists.values()].sort(bySizeReverse)

          return [root, sorted]
        })
    })
}

function albumsIntoArtistTracks (albums) {
  const artistTracks = new Map()
  for (let album of albums)
    for (let track of album.tracks) {
      let saved = safe(track.artist)
      if (saved !== album.artist) {
        log.silly('albumsIntoArtistTracks', 'track artist', saved, '!==', album.artist)
        if (!artistTracks.get(track.artist)) {
          log.verbose('albumsIntoArtistTracks', 'creating artist track set for', track.artist)
          artistTracks.set(track.artist, new Set())
        }
        artistTracks.get(track.artist).add(track)
      }
    }

  log.verbose(
    'albumsIntoArtistTracks',
    'artists',
    [...artistTracks.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(e => e[0])
  )
  return artistTracks
}

function albumsAndTracksToArtists (albums, artistTracks) {
  const artists = new Map()
  for (let album of albums) {
    if (!artists.get(album.artist)) {
      log.verbose('albumsAndTracksToArtists', 'creating artist for', album.artist)
      artists.set(album.artist, new Artist(album.artist))
    }
    artists.get(album.artist).albums.push(album)
  }

  for (let [artist, tracks] of [...artistTracks.entries()]) {
    if (!artists.get(artist)) {
      log.verbose('albumsAndTracksToArtists', 'creating artist for', artist)
      artists.set(artist, new Artist(artist))
    }
    artists.get(artist).addOtherTracks([...tracks.values()])
  }

  return artists
}

// export default scanArtists
module.exports = scanArtists
