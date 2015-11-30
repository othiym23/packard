import { basename } from 'path'

import FLACParser from 'flac-parser'
import log from 'npmlog'

import { Album, Artist, AudioFile, Track } from '@packard/model'

export default function reader (path, progressGroups, extras, onFinish, onError) {
  const name = basename(path)
  let gauge = progressGroups.get(name)
  if (!gauge) {
    gauge = log.newGroup(name)
    progressGroups.set(name, gauge)
  }

  const streamData = extras.streamData = {}
  const flacTags = extras.flacTags = {}
  const musicbrainzTags = extras.musicbrainzTags = {}
  const throughWatcher = gauge.newStream('FLAC tags: ' + name, extras.stats.size)

  return throughWatcher
    .pipe(new FLACParser())
    .on('data', d => {
      if (d.type.match(/^MUSICBRAINZ_/)) {
        musicbrainzTags[d.type] = d.value
      } else if (d.type.match(/[a-z]/)) {
        streamData[d.type] = d.value
      } else {
        flacTags[d.type] = d.value
      }
    })
    .on('error', onError)
    .on('finish', () => {
      throughWatcher.end()
      gauge.verbose('flac.scan', 'finished scanning', path)
      extras.file = new AudioFile(path, extras.stats, extras.streamData)

      gauge.silly('flac.scan', path, 'streamData', streamData)
      if (streamData.duration) extras.duration = parseFloat(streamData.duration)

      gauge.silly('flac.scan', path, 'flacTags', flacTags)
      if (flacTags.TRACKNUMBER) extras.index = parseInt(flacTags.TRACKNUMBER, 10)
      if (flacTags.DISCNUMBER) extras.disc = parseInt(flacTags.DISCNUMBER, 10)
      if (flacTags.DATE) extras.date = flacTags.DATE

      const artist = new Artist(flacTags.ARTIST)
      const albumArtist = flacTags.ALBUMARTIST ? new Artist(flacTags.ALBUMARTIST) : artist
      const album = new Album(flacTags.ALBUM, albumArtist)
      const track = new Track(flacTags.TITLE, album, artist, extras)
      onFinish({ track })
    })
}
