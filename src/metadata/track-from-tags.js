import { Album, Artist, Track } from '@packard/model'

export default function trackFromTags (info) {
  const tags = info.tags
  let artist, albumArtist, album
  if (tags.artist) {
    artist = new Artist(tags.artist)
  } else if (tags.albumArtist) {
    artist = new Artist(tags.albumArtist)
  }

  if (tags.albumArtist) {
    albumArtist = new Artist(tags.albumArtist)
  } else if (artist) {
    albumArtist = artist
  }

  if (tags.album && albumArtist) {
    album = new Album(tags.album, albumArtist)
  }

  return new Track(tags.title, album, artist, info)
}
