import { extname } from 'path'

import File from './file.js'

export default class Cover extends File {
  constructor (path, stats) {
    const extension = extname(path)
    super(path, stats, extension)
    this.format = extension.slice(1)
  }
}
