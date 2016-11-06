import log from 'npmlog'
import Bluebird from 'bluebird'

import albumsFromTracks from '../metadata/albums-from-tracks.js'
import readFSMetadata from '../fs/read-metadata.js'
import scan from '../metadata/scan.js'
import { Artist } from '@packard/model'
import { byLocale, bySize } from '../utils/sort.js'

function safe (string) {
  return string.replace(/[^ \]\[A-Za-z0-9-]/g, '')
}

function albumsIntoArtistTracks (albums) {
  const artistTracks = new Map()
  for (let album of albums) {
    for (let track of album.tracks) {
      let saved = safe(track.artist.name)
      if (saved !== album.artist) {
        log.silly('albumsIntoArtistTracks', 'track artist', saved, '!==', album.artist)
        if (!artistTracks.get(track.artist.name)) {
          log.verbose('albumsIntoArtistTracks', 'creating artist track set for', track.artist.name)
          artistTracks.set(track.artist.name, new Set())
        }
        artistTracks.get(track.artist.name).add(track)
      }
    }
  }

  log.verbose('albumsIntoArtistTracks', 'artists', [...artistTracks.keys()].sort(byLocale))
  return artistTracks
}

function albumsAndTracksToArtists (albums, artistTracks) {
  const artists = new Map()
  for (let album of albums) {
    if (!artists.get(album.artist.name)) {
      log.verbose('albumsAndTracksToArtists', 'creating artist for', album.artist.name)
      artists.set(album.artist.name, album.artist)
    }
    artists.get(album.artist.name).albums.push(album)
  }

  for (let [artistName, tracks] of [...artistTracks.entries()]) {
    if (!artists.get(artistName)) {
      log.verbose('albumsAndTracksToArtists', 'creating artist for', artistName)
      artists.set(artistName, new Artist(artistName))
    }
    artists.get(artistName).addOtherTracks([...tracks.values()])
  }

  return artists
}

function tracksToArtists (tracks) {
  // 1. convert tracks into albums
  const albums = albumsFromTracks(tracks)

  // 2. find artist tracks that aren't on single-artist albums
  const artistTracks = albumsIntoArtistTracks(albums)

  // 3. roll up albums to artists
  // 4. add loose tracks to artists
  return albumsAndTracksToArtists(albums, artistTracks)
}

export default function scanArtists (files = [], roots = [], progressGroups = new Map()) {
  log.enableProgress()
  roots = files.concat(roots)

  return Bluebird.mapSeries(
    roots,
    (root) => {
      log.verbose('scanArtists', 'processing', root)

      const artists = readFSMetadata(root).map(
        (info) => scan(info, progressGroups),
        { concurrency: 2 }
      ).then(tracksToArtists)

      return artists.then((artists) => [root, artists])
    }
  ).then(report)
}

function report (roots) {
  log.disableProgress()
  for (let [root, artists] of roots) {
    const sorted = [...artists.values()].sort(bySize)
    if (sorted.length) {
      console.log('\nROOT %s:', root)
      for (let a of sorted) {
        console.log('%s [%sM]', a.name, a.getSize(1024 * 1024))
      }
    }
  }
}
