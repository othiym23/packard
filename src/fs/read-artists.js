import readAlbums from './read-albums.js'

export function readArtists (root) {
  return readAlbums(root).then((albums) => {
    const artists = new Map()

    for (let album of albums.values()) {
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
