import moment from 'moment'

function toMoment (date) {
  let components = (date || '1970-01-01').split('-')
  switch (components.length) {
    case 1: return moment(date, 'YYYY')
    case 2: return moment(date, 'YYYY-MM')
    case 3: return moment(date, 'YYYY-MM-DD')
    default: throw new TypeError(date + 'is not a recognizable date')
  }
}

export function byDate (a, b) {
  let am = toMoment(a.date)
  let bm = toMoment(b.date)

  if (am.isBefore(bm)) {
    return -1
  } else if (am.isSame(bm)) {
    return a.name.localeCompare(b.name)
  } else {
    return 1
  }
}

export function bySize (a, b) {
  return b.getSize() - a.getSize()
}

export function byLocale (a, b) {
  return a.localeCompare(b)
}
