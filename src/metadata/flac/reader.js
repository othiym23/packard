import { basename } from 'path'

import FLACParser from 'flac-parser'
import log from 'npmlog'

import trackFromTags from '../track-from-tags.js'
import { AudioFile } from '@packard/model'
import { typeToStreamData, typeToTag, typeToMB } from './tag-maps.js'

export default function reader (info, progressGroups, onFinish, onError) {
  const path = info.path
  const name = basename(path)
  let gauge = progressGroups.get(name)
  if (!gauge) {
    gauge = log.newGroup(name)
    progressGroups.set(name, gauge)
  }

  const streamData = info.streamData = {}
  const tags = info.tags = {}
  const musicbrainzTags = info.musicbrainzTags = {}
  const throughWatcher = gauge.newStream('FLAC tags: ' + name, info.stats.size)

  return throughWatcher
    .pipe(new FLACParser())
    .on('data', ({ type, value }) => {
      if (typeToTag.get(type)) {
        tags[typeToTag.get(type)] = value
      } else if (typeToMB.get(type)) {
        musicbrainzTags[typeToMB.get(type)] = value
      } else if (typeToStreamData.get(type)) {
        streamData[typeToStreamData.get(type)] = value
      } else {
        gauge.warn('flac.read', 'unknown type', type, 'value', value)
      }
    })
    .on('error', onError)
    .on('finish', () => {
      throughWatcher.end()
      gauge.verbose('flac.read', 'finished scanning', path)
      info.file = new AudioFile(path, info.stats, info.streamData)

      gauge.silly('flac.read', path, 'streamData', streamData)
      if (streamData.duration) info.duration = parseFloat(streamData.duration)

      gauge.silly('flac.read', path, 'tags', tags)
      gauge.silly('flac.read', path, 'musicbrainzTags', musicbrainzTags)

      onFinish({ track: trackFromTags(info) })
    })
}
