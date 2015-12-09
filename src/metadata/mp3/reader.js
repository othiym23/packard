import 'babel-polyfill'

import { basename } from 'path'

import log from 'npmlog'
import mm from 'musicmetadata'

import { Album, Artist, AudioFile, Track } from '@packard/model'
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
  const throughWatcher = gauge.newStream('Tags: ' + name, info.stats.size)

  let textFrames = []
  const rawTags = new Map()
  const parser = mm(
    throughWatcher,
    { duration: true, fileSize: info.stats.size },
    (err) => {
      if (err) return onError(err)

      throughWatcher.end()
      gauge.verbose('mp3.read', 'finished scanning', path)
      info.file = new AudioFile(path, info.stats, info.streamData)

      chunkFramesIntoTags(textFrames, rawTags)
      for (let [type, value] of rawTags) {
        if (typeToTag.get(type)) {
          tags[typeToTag.get(type)] = value
        } else if (typeToMB.get(type)) {
          musicbrainzTags[typeToMB.get(type)] = value
        } else if (typeToStreamData.get(type)) {
          streamData[typeToStreamData.get(type)] = value
        } else {
          gauge.warn('mp3.read', 'unknown type', type, 'value', value)
        }
      }

      gauge.silly('mp3.read', path, 'streamData', streamData)
      if (streamData.duration) info.duration = streamData.duration
      if (tags.tracks) {
        tags.index = parseInt(tags.tracks.split('/')[0], 10)
        tags.tracks = parseInt(tags.tracks.split('/')[1], 10)
      }
      if (tags.discs) {
        tags.disc = parseInt(tags.discs.split('/')[0], 10)
        tags.discs = parseInt(tags.discs.split('/')[1], 10)
      }
      if (musicbrainzTags.trackID &&
          musicbrainzTags.trackID.owner_identifier === 'http://musicbrainz.org') {
        musicbrainzTags.trackID = musicbrainzTags.trackID.identifier.toString()
      }
      if (tags.comment && tags.comment.text) tags.comment = tags.comment.text
      if (tags.date && tags.monthYear) {
        const my = tags.monthYear
        tags.date = tags.date + '-' + my.slice(0, 2) + '-' + my.slice(2)
      }

      gauge.silly('mp3.read', path, 'tags', tags)
      gauge.verbose('mp3.read', 'musicbrainzTags', musicbrainzTags)

      const artist = new Artist(tags.artist)
      const albumArtist = tags.albumArtist ? new Artist(tags.albumArtist) : artist
      const album = new Album(tags.album, albumArtist)
      const track = new Track(tags.title, album, artist, info)
      onFinish({ track })
    }
  )

  const _emit = parser.emit
  const ignoredTypes = [
    'TXXX',
    'album',
    'albumartist',
    'artist',
    'comment',
    'composer',
    'disk',
    'genre',
    'picture',
    'title',
    'track',
    'year'
  ]
  parser.emit = function (type) {
    if (!(typeToStreamData.get(type) ||
          typeToTag.get(type) ||
          typeToMB.get(type) ||
          ignoredTypes.indexOf(type) !== -1)) {
      gauge.info('mp3.read', 'unknown tag', [].slice.call(arguments))
    }
    return _emit.apply(this, arguments)
  }
  addTagListeners(parser, rawTags)
  parser.on('TXXX', frame => textFrames.push(frame))

  return throughWatcher
}

function chunkFramesIntoTags (frames, tags) {
  while (frames.length) {
    tags.set(frames[0], frames[1])
    frames = frames.slice(2)
  }
}

function addTagListeners (parser, tags) {
  for (let map of [typeToStreamData, typeToTag, typeToMB])
    for (let [type] of map)
      parser.on(type, v => tags.set(type, v))
}
