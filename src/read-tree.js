import readAlbums from './read-fs-albums.js'

import Artist from './models/artist.js'

export default function toArtists (root) {
  return readAlbums(root).then(albums => {
    const artists = new Map()

    for (let album of albums) {
      let artist = artists.get(album.artist)
      if (!artist) {
        artist = new Artist(album.artist)
        artists.set(album.artist, artist)
      }

      artist.albums.push(album)
    }

    return [...artists.values()]
  })
}
