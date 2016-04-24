import { basename, dirname, extname } from 'path'

import log from 'npmlog'
import { MultitrackAlbum as Album, Artist, Cover, Cuesheet, File, Track } from '@packard/model'

export default function toModel (path, stats) {
  const ext = extname(path)

  switch (ext.toLowerCase()) {
    case '.flac':
    case '.mp3':
    case '.m4a':
    case '.aac':
    case '.wav':
    case '.aif':
      const filename = basename(path, ext)
      const directory = dirname(path)
      const potentialArtistName = basename(dirname(directory))
      const potentialAlbumName = basename(directory)

      const fsArtist = new Artist(potentialArtistName)
      const fsAlbum = new Album(potentialAlbumName, fsArtist, { path: directory })
      const fsTrack = new Track(
        filename,
        fsAlbum,
        fsArtist,
        { path, stats, ext }
      )
      parseName(fsTrack)

      return { fsArtist, fsAlbum, fsTrack, file: fsTrack, path }

    case '.jpg':
    case '.jpeg':
    case '.pdf':
    case '.png':
      const cover = new Cover(path, stats)

      return { cover, file: cover, path }

    case '.cue':
      const cuesheet = new Cuesheet(path, stats)

      return { cuesheet, file: cuesheet, path }

    default:
      log.warn('extractRelease', "don't recognize type of", path)
      const file = new File(path, stats, ext)

      return { file, path }
  }
}

const BOOMKAT_PATTERN = /^(\d+)-(.+)$/
function parseName (track) {
  const parsed = track.name.match(BOOMKAT_PATTERN) || []
  const index = parsed[1]
  const name = parsed[2]
  if (index && name) {
    track.index = parseInt(index, 10)
    track.name = name.replace(/_/g, ' ')
  }
}
