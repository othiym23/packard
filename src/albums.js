import log from 'npmlog'
import moment from 'moment'
import Bluebird from 'bluebird'

import albumsFromFLACTracks from './flac/albums-from-tracks.js'
import flatten from './flatten-tracks.js'
import readArtists from './read-fs-artists.js'
import scanFLAC from './flac/scan.js'

function toMoment (date) {
  let components = (date || '1970-01-01').split('-')
  switch (components.length) {
    case 1: return moment(date, 'YYYY')
    case 2: return moment(date, 'YYYY-MM')
    case 3: return moment(date, 'YYYY-MM-DD')
    default: throw new TypeError(date + 'is not a recognizable date')
  }
}

function byDate (a, b) {
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

export default function scanAlbums (roots, trackerGroups = new Map()) {
  return Bluebird.map(
      roots,
      root => {
        log.verbose('scanAlbums', 'processing', root)
        return readArtists(root)
                 .then(flatten)
                 .map(track => scanFLAC(track.path, trackerGroups, track), { concurrency: 2 })
      },
      { concurrency: 2 }
    )
    .then(tracks => albumsFromFLACTracks(tracks))
    .then(albums => {
      log.silly('scanAlbums', 'albums', albums)
      const sorted = [...albums].sort(byDate)
      log.silly('scanAlbums', 'sorted', sorted.map(a => '[' + a.date + '] ' + a.name))

      return sorted
    })
}
