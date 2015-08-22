var Album = require('./album-base.js')

export default class SingletrackAlbum extends Album {
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

SingletrackAlbum.fromTrack = (track) => {
  return new SingletrackAlbum(
    track.name,
    track.album,
    track.path,
    {
      size: track.size,
      blockSize: track.blockSize,
      blocks: track.blocks
    }
  )
}
