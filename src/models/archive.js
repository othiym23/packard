import File from './file.js'

export default class Archive extends File {
  constructor (path, stats, info) {
    super(path, stats)
    this.info = info
  }
}
