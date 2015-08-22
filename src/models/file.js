import { basename } from 'path'

export default class File {
  constructor (path, stats, ext) {
    this.path = path
    this.size = stats.size
    this.blockSize = stats.blksize
    this.blocks = stats.blocks
    this.name = basename(path, ext)
    this.ext = ext
  }

  fullName () {
    return this.path
  }

  safeName () {
    return this.fullName().replace(/[^ ()\]\[A-Za-z0-9.-]/g, '')
  }

  getSize (bs = 1) {
    return Math.ceil(this.size / bs)
  }
}
