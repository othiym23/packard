import { basename } from 'path'

import log from 'npmlog'
import mm from 'musicmetadata'

import { Album, Artist, AudioFile, Track } from '@packard/model'

export function reader (path, progressGroups, extras, onFinish, onError) {
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

  let textFrames = []
  const parser = mm(
    throughWatcher,
    { duration: true, fileSize: extras.stats.size },
    (err, metadata) => {
      if (err) return onError(err)

      gauge.verbose('mp3.scan', 'finished scanning', path)
      extras.file = new AudioFile(path, extras.stats, streamData)

      for (let tag in metadata) tags[tag] = metadata[tag]
      chunkFrames(textFrames, musicbrainzTags)

      gauge.silly('mp3.scan', path, 'streamData', streamData)
      if (metadata.duration) extras.duration = streamData.duration

      gauge.silly('mp3.scan', path, 'tags', tags)
      if (tags.track && tags.track.no) extras.index = tags.track.no
      if (tags.disk && tags.disk.no) extras.disc = tags.disk.no

      const artist = new Artist(tags.artist)
      const albumArtist = tags.albumartist ? new Artist(tags.albumartist) : artist
      const album = new Album(tags.album, albumArtist)
      const track = new Track(tags.title, album, artist, extras)
      onFinish({ track })
    }
  )

  parser.on('TXXX', frame => textFrames.push(frame))

  return throughWatcher
}

function chunkFrames (frames, tags) {
  while (frames.length) {
    tags[frames[0]] = frames[1]
    frames = frames.slice(2)
  }
}
