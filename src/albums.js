const log = require('npmlog')
const moment = require('moment')
const Promise = require('bluebird')

const flac = require('./metadata/flac.js')
const readTree = require('./read-tree.js')
const flatten = require('./flatten-tracks.js')

import audit from './metadata/audit.js'

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

function scanAlbums (roots, trackers) {
  return Promise.map(
      roots,
      root => readTree(root).then(artists => [root, flatten(artists)])
    ).map(([root, entities]) => {
      log.verbose('scanAlbums', 'processing', root)
      return Promise.map(
          [...entities],
          entity => flac.scan(entity.path, trackers, entity).then(audit),
          {concurrency: 4}
        ).then(tracks => flac.albumsFromMetadata(tracks))
    }).then(albums => {
      const sorted = albums.reduce((all, list) => all.concat([...list]), [])
      sorted.sort(byDate)
      log.silly('scanAlbums', 'sorted', sorted.map(a => '[' + a.date + '] ' + a.name))

      return sorted
    })
}

module.exports = scanAlbums
