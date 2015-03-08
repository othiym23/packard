const log = require('npmlog')

const genres = new Set([
  'Disco',
  'Dubstep',
  'Electronic',
  'House',
  'IDM',
  'Techno',
  'UK Garage'
])
const datePattern = /^(([0-9]{4,4})(-([0-9]{2,2}))?(-([0-9]{2,2}))?)/

function audit (bundle) {
  const path = bundle.path
  log.info('audit', 'auditing', path)
  if (!bundle.metadata) {
    log.warn('audit', path, 'has no raw metadata')
  } else {
    if (bundle.metadata.GENRE && !genres.has(bundle.metadata.GENRE)) {
      log.warn('audit', path, 'has unknown genre', bundle.metadata.GENRE)
    }
  }

  const date = bundle.flacTrack && bundle.flacTrack.date
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

  if (!bundle.fsTrack) log.warn('audit', path, 'has no filesystem-based track metadata')
  if (!bundle.fsAlbum) log.warn('audit', path, 'has no filesystem-based album metadata')
  if (!bundle.fsArtist) log.warn('audit', path, 'has no filesystem-based artist metadata')
  return bundle
}

module.exports = audit
