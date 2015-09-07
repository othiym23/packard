import { basename, dirname, extname } from 'path'

import { Album, Artist, Cover, Cuesheet, File, Track } from '@packard/model'

export default function toModel (path, stats) {
  const directory = dirname(path)
  const extension = extname(path)
  const filename = basename(path, extension)

  switch (extension.toLowerCase()) {
    case '.flac':
    case '.mp3':
    case '.m4a':
    case '.aac':
    case '.wav':
    case '.aif':
      const artist = new Artist(basename(dirname(directory)))
      const album = new Album(basename(directory), artist, { path: directory })
      const track = new Track(
        filename,
        album,
        artist,
        { path, stats, ext: extension }
      )
      parseName(track)
      return track
    case '.jpg':
    case '.pdf':
    case '.png':
      return new Cover(
        path,
        stats
      )
    case '.cue':
      return new Cuesheet(
        path,
        stats
      )
    default:
      return new File(
        path,
        stats,
        extension
      )
  }
}

const BOOMKAT_PATTERN = /^(\d+)-(.+)$/
function parseName (track) {
  let [, index, name] = track.name.match(BOOMKAT_PATTERN) || []
  if (index && name) {
    track.index = parseInt(index, 10)

    name = name.replace(/_/g, ' ')
    track.name = name
  }
}
