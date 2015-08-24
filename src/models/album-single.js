import { extname } from 'path'

import Album from './album-base.js'
import Artist from './artist.js'
import File from './file.js'

export default class SingletrackAlbum extends Album {
  constructor (name, artist, optional = {}) {
    super(name, artist, optional.path)

    this.cuesheet = optional.cuesheet || null

    if (optional.file) {
      this.file = optional.file
    } else if (optional.path && optional.stats) {
      this.file = new File(
        optional.path,
        optional.stats,
        extname(optional.path)
      )
    } else {
      this.file = null
    }
  }

  getSize (bs) {
    return this.file && this.file.getSize() || 0
  }
}

SingletrackAlbum.fromTrack = (track) => {
  return new SingletrackAlbum(
    track.name,
    new Artist(track.album.name),
    { file: track.file }
  )
}
