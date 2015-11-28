import validate from 'aproba'

const datePattern = /^(([0-9]{4,4})(-([0-9]{2,2}))?(-([0-9]{2,2}))?)/
export default function validateISODate (track, warnings) {
  validate('OA', arguments)
  const date = track.date
  if (!date) {
    warnings.push('is undated')
  } else {
    const match = date.match(datePattern) || []
    const year = match[2]
    const month = match[4]
    const day = match[6]
    if (!year) {
      warnings.push('has no release year in "' + date + '"')
    } else if (!month) {
      warnings.push('has no release month in "' + date + '"')
    } else if (!day) {
      warnings.push('has no release day in "' + date + '"')
    }
  }
}
