var Album = require('./album-base.js')

class SingletrackAlbum extends Album {
  constructor (name, artist, path, stats) {
    super(name, artist, path)

    this.cuesheet = null

    this.size = stats.size
    this.blockSize = stats.blksize
    this.blocks = stats.blocks
  }

  getSize (bs = 1) {
    return Math.ceil(this.size / bs)
  }
}

module.exports = SingletrackAlbum
