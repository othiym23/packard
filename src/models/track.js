class Track {
  constructor (artist, album, name, stats, albumArtist = artist) {
    this.artist = artist
    this.album = album
    this.name = name
    this.size = stats.size
    this.blockSize = stats.blksize
    this.blocks = stats.blocks
    this.albumArtist = albumArtist
  }

  getSize (bs = 1) {
    return Math.ceil(this.size / bs)
  }
}

module.exports = Track
