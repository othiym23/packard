import { extname } from 'path'

import File from './file.js'

export default class Cuesheet extends File {
  constructor (path, stats) {
    super(path, stats, extname(path))
  }
}
