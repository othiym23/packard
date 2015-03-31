const log = require('npmlog')
const moment = require('moment')
const Promise = require('bluebird')

const flac = require('./metadata/flac.js')
const readRootFlat = require('./read-root.js').readRootFlat

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

function scanAlbums (roots, groups) {
  return Promise.map(
      roots,
      root => readRootFlat(root).then(entities => [root, entities])
    ).map(([root, entities]) => {
      log.verbose('scanAlbums', 'processing', root)
      return Promise.map(
          [...entities],
          entity => flac.fsEntitiesIntoBundles(entity, groups),
          {concurrency: 4}
        ).then(bundles => {
          const trackSets = flac.bundlesIntoTrackSets(bundles)
          const albums = flac.trackSetsIntoAlbums([...trackSets.values()])

          return albums
        })
    }).then(albums => {
      const sorted = albums.reduce((all, list) => all.concat([...list]), [])
      sorted.sort(byDate)
      log.silly('scanAlbums', 'sorted', sorted.map(a => '[' + a.date + '] ' + a.name))

      return sorted
    })
}

module.exports = scanAlbums
