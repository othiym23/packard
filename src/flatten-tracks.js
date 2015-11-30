export default function flatten (artists) {
  const tracks = new Set()
  for (let fsArtist of artists)
    for (let fsAlbum of fsArtist.albums)
      for (let fsTrack of (fsAlbum.tracks || []))
        tracks.add({ fsArtist, fsAlbum, fsTrack, path: fsTrack.file.path })

  return tracks
}
