const extname = require('path').extname

export default class Cover {
  constructor (path, stats) {
    this.path = path
    this.format = extname(path).slice(1)
    this.size = stats.size
    this.blockSize = stats.blksize
    this.blocks = stats.blocks
  }

  getSize (bs = 1) {
    return Math.ceil(this.size / bs)
  }
}
