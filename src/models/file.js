import { basename, extname } from 'path'

export default class File {
  constructor (path, stats, ext = extname(path)) {
    this.path = path
    this.stats = stats
    this.ext = ext

    // derived properties
    this.name = basename(path, this.ext)
  }

  fullName () {
    return this.path
  }

  safeName () {
    return this.fullName().replace(/[^ ()\]\[A-Za-z0-9.-]/g, '')
  }

  getSize (bs = 1) {
    return Math.ceil(this.stats.size / bs)
  }
}
