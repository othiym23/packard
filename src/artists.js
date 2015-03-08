/*eslint-disable no-undef*/ // oh eslint
const Promise = require('bluebird')
/*eslint-enable no-undef*/

const log = require('npmlog')

const audit = require('./metadata/audit.js')
const flac = require('./metadata/flac.js')
const readRoot = require('./read-root.js')
const Album = require('./models/album-multi.js')
const Artist = require('./models/artist.js')
const Track = require('./models/track.js')

function reverseSize (a, b) {
  return b.getSize() - a.getSize()
}

function safe (string) {
  return string.replace(/[^ \]\[A-Za-z0-9-]/g, '')
}

function scanArtists (roots, groups) {
  return Promise.resolve(roots)
    .map(root => {
      const tracks = new Set()
      return readRoot(root).then(artists => {
        for (let artist of artists)
          for (let album of artist.albums)
            for (let track of album.tracks)
              tracks.add({artist, album, track, stats: track.stats})

        return tracks
      }).then(entities => [root, entities])
    })
    .map(([root, entities]) => {
      log.verbose('scanArtists', 'processing', root)
      return Promise.resolve([...entities])
        .map(entity => fsEntitiesIntoBundles(entity, groups), {concurrency: 4})
        .then(bundles => {
          // 1. bundle the tracks into sets
          const trackSets = bundlesIntoTrackSets(bundles)

          // 2. convert the sets into albums
          const albums = trackSetsIntoAlbums([...trackSets.values()])

          // 3. find artist tracks that aren't on single-artist albums
          const artistTracks = albumsIntoArtistTracks(albums)

          // 4. roll up albums to artists
          // 5. add loose tracks to artists
          const artists = albumsAndTracksToArtists(albums, artistTracks)

          // 6. compile list per-artist
          const sorted = [...artists.values()].sort(reverseSize)

          return [root, sorted]
        })
    })
}

function fsEntitiesIntoBundles ({artist, album, track}, groups) {
  groups.set(track.name, log.newGroup('read: ' + track.path))

  return flac
    .scan(track.path, groups)
    .then(b => {
      b.fsArtist = artist
      b.fsAlbum = album
      b.fsTrack = track
      b.flacTrack = Track.fromFLAC(b.metadata, b.path, b.stats)

      return b
    })
    .then(audit)
}

function bundlesIntoTrackSets (bundles) {
  const trackSets = new Map()

  // 1. bundle the tracks into sets
  for (let bundle of bundles) {
    let key

    const albumArtist = bundle.fsAlbum.artist
    key = albumArtist + ' - ' + bundle.flacTrack.album
    if (!trackSets.get(key)) {
      log.verbose('artists', 'creating set for tracks on:', key)
      trackSets.set(key, new Set())
    }
    const trackSet = trackSets.get(key)
    bundle.trackSet = trackSet
    trackSet.add(bundle)
  }

  return trackSets
}

function trackSetsIntoAlbums (trackSets) {
  const albums = new Set()

  for (let trackSet of trackSets) {
    const tracks = [...trackSet].map(t => t.flacTrack)
    const sorted = tracks.sort((a, b) => a.index - b.index)

    const albumArtists = [...trackSet].reduce((s, b) => s.add(b.fsAlbum.artist), new Set())
    if (albumArtists.size > 1) {
      log.warn('artists', 'many artists found', [...albumArtists])
    }

    const dates = tracks.reduce((s, t) => s.add(t.date), new Set())
    if (dates.size > 1) {
      log.warn('artists', 'many dates found', [...dates])
    }

    const names = tracks.reduce((s, t) => s.add(t.album), new Set())
    if (dates.size > 1) {
      log.warn('artists', 'many album names found', [...names])
    }

    albums.add(new Album([...names][0], [...albumArtists][0], '-', sorted))
  }

  return albums
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
