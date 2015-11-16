import log from 'npmlog'
import moment from 'moment'
import Bluebird from 'bluebird'

import albumsFromFLACTracks from './flac/albums-from-tracks.js'
import audit from './metadata/audit.js'
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

export default function scanAlbums (roots, trackers) {
  return Bluebird.map(
      roots,
      root => readArtists(root).then(artists => [root, flatten(artists)])
    ).map(([root, entities]) => {
      log.verbose('scanAlbums', 'processing', root)
      return Bluebird.map(
          [...entities],
          entity => scanFLAC(entity.path, trackers, entity).then(audit),
          {concurrency: 4}
        ).then(tracks => albumsFromFLACTracks(tracks))
    }).then(albums => {
      const sorted = albums.reduce((all, list) => all.concat(...list), [])
      sorted.sort(byDate)
      log.silly('scanAlbums', 'sorted', sorted.map(a => '[' + a.date + '] ' + a.name))

      return sorted
    })
}
