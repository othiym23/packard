/*eslint-disable no-undef*/ // oh eslint
const Promise = require('bluebird')
/*eslint-enable no-undef*/

const log = require('npmlog')

const flac = require('./metadata/flac.js')
const readRootFlat = require('./read-root.js').readRootFlat
const Artist = require('./models/artist.js')

function bySizeReverse (a, b) {
  return b.getSize() - a.getSize()
}

function safe (string) {
  return string.replace(/[^ \]\[A-Za-z0-9-]/g, '')
}

function scanArtists (roots, groups) {
  return Promise.map(
      roots,
      root => readRootFlat(root).then(entities => [root, entities])
    ).map(([root, entities]) => {
      log.verbose('scanArtists', 'processing', root)
      return Promise.map(
          [...entities],
          entity => flac.fsEntitiesIntoBundles(entity, groups),
          {concurrency: 4}
        ).then(bundles => {
          // 1. bundle the tracks into sets
          const trackSets = flac.bundlesIntoTrackSets(bundles)

          // 2. convert the sets into albums
          const albums = flac.trackSetsIntoAlbums([...trackSets.values()])

          // 3. find artist tracks that aren't on single-artist albums
          const artistTracks = albumsIntoArtistTracks(albums)

          // 4. roll up albums to artists
          // 5. add loose tracks to artists
          const artists = albumsAndTracksToArtists(albums, artistTracks)

          // 6. compile list per-artist
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
