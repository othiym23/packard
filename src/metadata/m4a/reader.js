import 'babel-polyfill'

import { basename } from 'path'

import log from 'npmlog'
import MP4Parser from 'mp4-parser'

import { Album, Artist, AudioFile, Track } from '@packard/model'
import { parseGapless, parseNormalization } from '../../utils/itunes.js'

const atomToStreamData = new Map([
  ['duration', 'duration']
])

const atomToTag = new Map([
  ['©alb', 'album'],
  ['©ART', 'artist'],
  ['©cmt', 'comment'],
  ['©day', 'date'],
  ['©gen', 'genre'],
  ['©nam', 'title'],
  ['©too', 'encodedWith'],
  ['aART', 'albumArtist'],
  ['ASIN', 'ASIN'],
  ['BARCODE', 'upc'],
  ['covr', 'picture'],
  ['cpil', 'isCompilation'],
  ['disk', 'discs'],
  ['pgap', 'hasPregap'],
  ['purd', 'purchaseDate'],
  ['soaa', 'sortAlbumArtist'],
  ['soar', 'sortArtist'],
  ['tmpo', 'bpm'],
  ['trkn', 'tracks'],
  ['iTunes_CDDB_IDs', 'cddb'],
  ['iTunNORM', 'iTunesNormalization'],
  ['iTunSMPB', 'iTunesGaplessData']
])

const atomToMB = new Map([
  ['MusicBrainz Album Artist Id', 'albumArtistID'],
  ['MusicBrainz Album Id', 'albumID'],
  ['MusicBrainz Album Release Country', 'releaseCountry'],
  ['MusicBrainz Album Status', 'status'],
  ['MusicBrainz Album Type', 'type'],
  ['MusicBrainz Artist Id', 'artistID'],
  ['MusicBrainz Release Group Id', 'releaseGroupID'],
  ['MusicBrainz Release Track Id', 'releaseTrackID'],
  ['MusicBrainz Track Id', 'trackID'],
  ['MusicIP PUID', 'puid'],
  ['Acoustid Id', 'acoustID'],
  ['ARTISTS', 'artists'],
  ['CATALOGNUMBER', 'catalogID'],
  ['DJMIXER', 'mixedBy'],
  ['LABEL', 'label'],
  ['LANGUAGE', 'language'],
  ['MEDIA', 'media'],
  ['SCRIPT', 'script']
])

// mp4-parser doesn't deal well with Apple's old iTunes atom types
// (this is the UTF-8 out-of-universe character)
const whoops = new Buffer([0xef, 0xbf, 0xbd])

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
    .on('data', ({ type, value }) => {
      let raw = new Buffer(type)
      if (raw.indexOf(whoops) === 0) type = '©' + raw.slice(3).toString()
      type = type.replace('----:com.apple.iTunes:', '')
      if (atomToTag.get(type)) {
        tags[atomToTag.get(type)] = value
      } else if (atomToMB.get(type)) {
        musicbrainzTags[atomToMB.get(type)] = value
      } else if (atomToStreamData.get(type)) {
        streamData[atomToStreamData.get(type)] = value
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
