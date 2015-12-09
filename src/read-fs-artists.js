import readAlbums from './read-fs-albums.js'

export function flatten (artists) {
  const tracks = new Set()
  for (let fsArtist of artists)
    for (let fsAlbum of fsArtist.albums)
      for (let fsTrack of (fsAlbum.tracks || []))
        tracks.add({ fsArtist, fsAlbum, fsTrack, path: fsTrack.file.path })

  return tracks
}

export function readArtists (root) {
  return readAlbums(root).then(albums => {
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

export default function readFSTracks (root) {
  return readArtists(root).then(flatten)
}
