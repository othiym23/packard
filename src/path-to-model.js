const { basename, dirname, extname } = require('path')

import Album from './models/album-multi.js'
import Artist from './models/artist.js'
import Cover from './models/cover.js'
import Cuesheet from './models/cuesheet.js'
import File from './models/file.js'
import Track from './models/track.js'

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
      const album = new Album(basename(directory), artist, directory)
      const track = new Track(
        artist,
        album,
        filename,
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
