import { extname } from 'path'

import flacReader from './flac/reader.js'
import mp3Reader from './mp3/reader.js'
import m4aReader from './m4a/reader.js'

export default function reader (info, progressGroups, onFinish, onError) {
  switch (extname(info.path)) {
    case '.flac':
      return flacReader(info, progressGroups, onFinish, onError)
    case '.mp3':
      return mp3Reader(info, progressGroups, onFinish, onError)
    case '.m4a':
      return m4aReader(info, progressGroups, onFinish, onError)
    default:
      throw new TypeError('Unknown file type for ' + info.path)
  }
}
