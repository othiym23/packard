import log from 'npmlog'

import validateGenreTag from './validators/genre-tag.js'
import validateISODate from './validators/iso-date.js'

export function auditTrack (track) {
  const warnings = []

  log.verbose('audit', 'auditing', track.artist.name, '-', track.name)
  validateGenreTag(track, warnings)
  validateISODate(track, warnings)

  return warnings
}

export default function auditAlbum (album) {
  let warnings = []

  log.verbose('audit', 'auditing', album.artist.name + ':', album.name)
  if (album.tracks) {
    for (let track of album.tracks) {
      for (let trackWarning of auditTrack(track)) {
        warnings.push(track.artist.name + ' - ' + track.name + ': ' + trackWarning)
      }
    }
  }
  return warnings
}
