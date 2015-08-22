export default function flatten (artists) {
  const tracks = new Set()
  for (let artist of artists)
    for (let album of artist.albums)
      for (let track of album.tracks)
        tracks.add({artist, album, track, stats: track.stats})

  return tracks
}
