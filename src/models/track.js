import sprintf from 'sprintf'

import File from './file.js'

export default class Track extends File {
  constructor (artist, album, name, path, stats, optional = {}) {
    super(path, stats, optional.ext || '.unknown')

    this.artist = artist
    this.album = album
    this.name = name
    this.albumArtist = optional.albumArtist || artist
    this.index = optional.index || 0
    this.disc = optional.disc || 0
    this.date = optional.date
    this.duration = optional.duration
  }

  fullName () {
    let base = ''
    if (this.artist) base += this.artist + ' - '
    if (this.album) base += this.album + ' - '
    if (this.index) base += sprintf('%02d', this.index) + ' - '
    return base + this.name + this.ext
  }
}

Track.fromFLAC = (md, path, stats) => {
  const optional = { ext: '.flac' }

  if (md.duration) optional.duration = parseFloat(md.duration)
  if (md.TRACKNUMBER) optional.index = parseInt(md.TRACKNUMBER, 10)
  if (md.DISCNUMBER) optional.disc = parseInt(md.DISCNUMBER, 10)
  if (md.DATE) optional.date = md.DATE

  return new Track(
    md.ARTIST,
    md.ALBUM,
    md.TITLE,
    path,
    stats,
    optional
  )
}
