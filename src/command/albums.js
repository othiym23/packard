import log from 'npmlog'
import Bluebird from 'bluebird'

import albumsFromTracks from '../metadata/albums-from-tracks.js'
import readFSTracks from '../read-fs-artists.js'
import scan from '../metadata/scan.js'
import { byDate, bySize } from '../utils/sort.js'

export function scanAlbums (roots, progressGroups = new Map()) {
  return Bluebird.map(
    roots,
    root => {
      log.verbose('scanAlbums', 'processing', root)
      return readFSTracks(root).map(
        fsTrack => scan(fsTrack.path, progressGroups, fsTrack),
        { concurrency: 2 }
      )
    },
    { concurrency: 1 }
  ).then(albumsFromTracks)
}

export default function showAlbums (files = [], roots = [], progressGroups) {
  log.enableProgress()
  roots = files.concat(roots)
  log.silly('showAlbums', 'scanning', roots)

  const sorted = scanAlbums(roots, progressGroups).then(albums => {
    log.silly('scanAlbums', 'albums', albums)
    const sorted = [...albums].sort(byDate)
    log.silly('scanAlbums', 'sorted', sorted.map(a => '[' + a.date + '] ' + a.name))

    log.disableProgress()
    return sorted
  })

  return sorted.then(report)
}

function report (albums) {
  const sorted = albums.sort(bySize)

  let total = 0
  for (let album of sorted) {
    total += album.getSize(512)
    console.log('%s [%sM]', album.path, album.getSize(1024 * 1024))
  }
  console.log('TOTAL: %s 512-byte blocks', total)
}
