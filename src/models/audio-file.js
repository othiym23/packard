import File from './file.js'

export default class AudioFile extends File {
  constructor (path, stats, streamData) {
    super(path, stats)
    this.streamData = streamData
  }
}
