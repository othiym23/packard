import readAlbums from './read-fs-albums.js'

export default function toArtists (root) {
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

    return [...artists.values()]
  })
}
