import log from 'npmlog'
import moment from 'moment'
import Promise from 'bluebird'

import albumsFromFLACTracks from './flac/albums-from-tracks.js'
import audit from './metadata/audit.js'
import flatten from './flatten-tracks.js'
import readTree from './read-tree.js'
import scanFLAC from './flac/scan.js'

function byDate (a, b) {
  let am = moment(a.date)
  let bm = moment(b.date)

  if (am.isBefore(bm)) {
    return -1
  } else if (am.isSame(bm)) {
    return a.name.localeCompare(b.name)
  } else {
    return 1
  }
}

export default function scanAlbums (roots, trackers) {
  return Promise.map(
      roots,
      root => readTree(root).then(artists => [root, flatten(artists)])
    ).map(([root, entities]) => {
      log.verbose('scanAlbums', 'processing', root)
      return Promise.map(
          [...entities],
          entity => scanFLAC(entity.path, trackers, entity).then(audit),
          {concurrency: 4}
        ).then(tracks => albumsFromFLACTracks(tracks))
    }).then(albums => {
      const sorted = albums.reduce((all, list) => all.concat([...list]), [])
      sorted.sort(byDate)
      log.silly('scanAlbums', 'sorted', sorted.map(a => '[' + a.date + '] ' + a.name))

      return sorted
    })
}
