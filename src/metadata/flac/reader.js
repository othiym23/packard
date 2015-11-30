import { basename } from 'path'

import FLACParser from 'flac-parser'
import log from 'npmlog'

import { Album, Artist, AudioFile, Track } from '@packard/model'
import { typeToStreamData, typeToTag, typeToMB } from './tag-maps.js'

export default function reader (path, progressGroups, extras, onFinish, onError) {
  const name = basename(path)
  let gauge = progressGroups.get(name)
  if (!gauge) {
    gauge = log.newGroup(name)
    progressGroups.set(name, gauge)
  }

  const streamData = extras.streamData = {}
  const tags = extras.tags = {}
  const musicbrainzTags = extras.musicbrainzTags = {}
  const throughWatcher = gauge.newStream('FLAC tags: ' + name, extras.stats.size)

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
        log.silly('flac.read', 'unknown type', type, 'value', value)
      }
    })
    .on('error', onError)
    .on('finish', () => {
      throughWatcher.end()
      gauge.verbose('flac.read', 'finished scanning', path)
      extras.file = new AudioFile(path, extras.stats, extras.streamData)

      gauge.silly('flac.read', path, 'streamData', streamData)
      if (streamData.duration) extras.duration = parseFloat(streamData.duration)

      gauge.silly('flac.read', path, 'tags', tags)
      gauge.silly('flac.read', path, 'musicbrainzTags', musicbrainzTags)
      if (tags.index) extras.index = parseInt(tags.index, 10)
      if (tags.disc) extras.disc = parseInt(tags.disc, 10)
      if (tags.date) extras.date = tags.date

      const artist = new Artist(tags.artist)
      const albumArtist = tags.albumArtist ? new Artist(tags.albumArtist) : artist
      const album = new Album(tags.album, albumArtist)
      const track = new Track(tags.title, album, artist, extras)
      onFinish({ track })
    })
}
