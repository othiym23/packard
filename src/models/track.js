import sprintf from 'sprintf'

import File from './file.js'

export default class Track {
  constructor (artist, album, name, optional = {}) {
    if (optional.path && optional.stats) {
      this.file = new File(
        optional.path,
        optional.stats,
        optional.ext || '.unknown'
      )
    } else {
      this.file = null
    }
    this.artist = artist
    this.album = album
    this.name = name
    this.albumArtist = optional.albumArtist || artist
    this.index = optional.index || 0
    this.disc = optional.disc || 0
    this.date = optional.date
    this.duration = optional.duration
  }

  getSize (bs) {
    return this.file && this.file.getSize(bs) || 0
  }

  safeName () {
    return this.fullName().replace(/[^ ()\]\[A-Za-z0-9.-]/g, '')
  }

  fullName () {
    let name = ''
    if (this.artist) name += this.artist + ' - '
    if (this.album) name += this.album + ' - '
    if (this.index) name += sprintf('%02d', this.index) + ' - '
    name += this.name
    if (this.file && this.file.ext) name += this.file.ext
    return name
  }
}

Track.fromFLAC = (md, path, stats) => {
  const optional = {
    path: path,
    stats: stats,
    ext: '.flac'
  }

  if (md.duration) optional.duration = parseFloat(md.duration)
  if (md.TRACKNUMBER) optional.index = parseInt(md.TRACKNUMBER, 10)
  if (md.DISCNUMBER) optional.disc = parseInt(md.DISCNUMBER, 10)
  if (md.DATE) optional.date = md.DATE

  return new Track(
    md.ARTIST,
    md.ALBUM,
    md.TITLE,
    optional
  )
}
