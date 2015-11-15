import fs from 'graceful-fs'
import { basename } from 'path'
import { createReadStream } from 'graceful-fs'

import Promise from 'bluebird'
import { promisify } from 'bluebird'

import FLACReader from 'flac-parser'
import log from 'npmlog'

import { Album, Artist, AudioFile, Track } from '@packard/model'

const stat = promisify(fs.stat)

export default function scan (path, trackers, extras = {}) {
  log.verbose('flac.scan', 'scanning', path)

  return stat(path).then(stats => new Promise((resolve, reject) => {
    const name = basename(path)
    let tracker = trackers.get(name)
    if (!tracker) {
      tracker = log.newGroup(name)
      trackers.set(name, tracker)
    }

    const streamData = {}
    const flacTags = extras.flacTags = {}
    const musicbrainzTags = extras.musicbrainzTags = {}

    createReadStream(path)
      .pipe(tracker.newStream('FLAC scan: ' + name, stats.size))
      .pipe(new FLACReader())
      .on('data', d => {
        if (d.type.match(/^MUSICBRAINZ_/)) {
          musicbrainzTags[d.type] = d.value
        } else if (d.type.match(/[a-z]/)) {
          streamData[d.type] = d.value
        } else {
          flacTags[d.type] = d.value
        }
      })
      .on('error', reject)
      .on('finish', () => {
        tracker.verbose('flac.scan', 'finished scanning', path)
        extras.file = new AudioFile(path, stats, streamData)

        tracker.silly('flac.scan', path, 'streamData', streamData)
        if (streamData.duration) extras.duration = parseFloat(streamData.duration)

        tracker.silly('flac.scan', path, 'flacTags', flacTags)
        if (flacTags.TRACKNUMBER) extras.index = parseInt(flacTags.TRACKNUMBER, 10)
        if (flacTags.DISCNUMBER) extras.disc = parseInt(flacTags.DISCNUMBER, 10)
        if (flacTags.DATE) extras.date = flacTags.DATE

        const artist = new Artist(flacTags.ARTIST)
        const albumArtist = flacTags.ALBUMARTIST ? new Artist(flacTags.ALBUMARTIST) : artist
        const album = new Album(flacTags.ALBUM, albumArtist)
        resolve(new Track(flacTags.TITLE, album, artist, extras))
      })
  }))
}
