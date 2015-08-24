const log = require('npmlog')

const genres = new Set([
  'Disco',
  'Drum\'n\'Bass',
  'Dubstep',
  'Electronic',
  'House',
  'IDM',
  'Techno',
  'UK Garage'
])
const datePattern = /^(([0-9]{4,4})(-([0-9]{2,2}))?(-([0-9]{2,2}))?)/

function audit (track) {
  const path = track.file.path
  log.info('audit', 'auditing', path)
  if (!track.flacTags) {
    log.warn('audit', path, 'has no raw metadata')
  } else {
    if (track.flacTags.GENRE && !genres.has(track.flacTags.GENRE)) {
      log.warn('audit', path, 'has unknown genre', track.flacTags.GENRE)
    }
  }

  const date = track.date
  if (!date) {
    log.warn('audit', path, 'is undated')
  } else {
    let match = date.match(datePattern)
    if (!match) match = []

    const year = match[2]
    const month = match[4]
    const day = match[6]
    if (!year) {
      log.warn('audit', path, 'has no release year in "' + date + '"')
    } else if (!month) {
      log.warn('audit', path, 'has no release month in "' + date + '"')
    } else if (!day) {
      log.warn('audit', path, 'has no release day in "' + date + '"')
    }
  }

  if (!track.fsTrack) log.warn('audit', path, 'has no filesystem-based track metadata')
  if (!track.fsAlbum) log.warn('audit', path, 'has no filesystem-based album metadata')
  if (!track.fsArtist) log.warn('audit', path, 'has no filesystem-based artist metadata')

  return track
}

module.exports = audit
