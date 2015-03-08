const sprintf = require('sprintf')

class Track {
  constructor (artist, album, name, path, stats, albumArtist = artist) {
    this.artist = artist
    this.album = album
    this.name = name
    this.path = path
    this.size = stats.size
    this.blockSize = stats.blksize
    this.blocks = stats.blocks
    this.albumArtist = albumArtist
    this.index = 0
    this.disc = 0
    this.date = null
    this.ext = '.unknown'
  }

  getSize (bs = 1) {
    return Math.ceil(this.size / bs)
  }

  fullName () {
    let base = ''
    if (this.artist) base += this.artist + ' - '
    if (this.album) base += this.album + ' - '
    if (this.index) base += sprintf("%02d", this.index) + ' - '
    return base + this.name + this.ext
  }

  safeName () {
    return this.fullName().replace(/[^ ()\]\[A-Za-z0-9.-]/g, '')
  }
}

Track.fromFLAC = (md, path, stats) => {
  const track = new Track(
    md.ARTIST,
    md.ALBUM,
    md.TITLE,
    path,
    stats
  )
  track.ext = '.flac'
  if (md.TRACKNUMBER) track.index = parseInt(md.TRACKNUMBER, 10)
  if (md.DISCNUMBER) track.disc = parseInt(md.DISCNUMBER, 10)
  if (md.DATE) track.date = md.DATE

  return track
}

module.exports = Track
