import 'babel-polyfill'

import { basename } from 'path'

import log from 'npmlog'
import MP4Parser from 'mp4-parser'

import { Album, Artist, AudioFile, Track } from '@packard/model'
import { typeToStreamData, typeToTag, typeToMB } from './tag-maps.js'
import { parseGapless, parseNormalization } from '../../utils/itunes.js'

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
  const throughWatcher = gauge.newStream('Tags: ' + name, extras.stats.size)

  return throughWatcher
    .pipe(new MP4Parser())
    .on('data', ({ busted, value }) => {
      const type = fixupType(busted)
      if (typeToTag.get(type)) {
        tags[typeToTag.get(type)] = value
      } else if (typeToMB.get(type)) {
        musicbrainzTags[typeToMB.get(type)] = value
      } else if (typeToStreamData.get(type)) {
        streamData[typeToStreamData.get(type)] = value
      } else {
        log.silly('m4a.read', 'unknown type', type, 'value', value)
      }
    })
    .on('error', onError)
    .on('finish', () => {
      throughWatcher.end()
      gauge.verbose('m4a.read', 'finished parsing', path)
      extras.file = new AudioFile(path, extras.stats, extras.streamData)

      gauge.silly('flac.scan', path, 'streamData', streamData)
      if (streamData.duration) extras.duration = parseFloat(streamData.duration)
      if (tags.tracks) {
        tags.index = parseInt(tags.tracks.split('/')[0], 10)
        tags.tracks = parseInt(tags.tracks.split('/')[1], 10)
      }
      if (tags.discs) {
        tags.disc = parseInt(tags.discs.split('/')[0], 10)
        tags.discs = parseInt(tags.discs.split('/')[1], 10)
      }
      if (tags.iTunesNormalization) {
        tags.iTunesNormalization = parseNormalization(tags.iTunesNormalization)
      }
      if (tags.iTunesGaplessData) {
        tags.iTunesGaplessData = parseGapless(tags.iTunesGaplessData)
      }

      gauge.silly('flac.scan', path, 'tags', tags)
      gauge.silly('flac.scan', path, 'musicbrainzTags', musicbrainzTags)
      if (tags.index) extras.index = tags.index
      if (tags.disc) extras.disc = tags.disc
      if (tags.date) extras.date = tags.date

      const artist = new Artist(tags.artist)
      const albumArtist = tags.albumArtist ? new Artist(tags.albumArtist) : artist
      const album = new Album(tags.album, albumArtist)
      const track = new Track(tags.title, album, artist, extras)
      onFinish({ track })
    })
}

// mp4-parser doesn't deal well with Apple's old iTunes atom types
// (this is the UTF-8 out-of-universe character)
const whoops = new Buffer([0xef, 0xbf, 0xbd])
function fixupType (maybeBroken) {
  let raw = new Buffer(maybeBroken)
  if (raw.indexOf(whoops) === 0) maybeBroken = '©' + raw.slice(3).toString()
  return maybeBroken.replace('----:com.apple.iTunes:', '')
}
