import { extname } from 'path'

import { reader as flacReader } from '../flac/scan.js'
import { reader as mp3Reader } from '../mp3/scan.js'

export default function reader (path, progressGroups, extras, onFinish, onError) {
  switch (extname(path)) {
    case '.flac':
      return flacReader(path, progressGroups, extras, onFinish, onError)
    case '.mp3':
      return mp3Reader(path, progressGroups, extras, onFinish, onError)
    default:
      throw new TypeError('Unknown file type for ' + path)
  }
}
