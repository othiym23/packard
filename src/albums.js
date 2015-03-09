/*eslint-disable no-undef*/ // oh eslint
const Promise = require('bluebird')
/*eslint-enable no-undef*/

const log = require('npmlog')
const moment = require('moment')

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
  return Promise.resolve(roots)
    .map(root => readRootFlat(root).then(entities => [root, entities]))
    .map(([root, entities]) => {
      log.verbose('scanAlbums', 'processing', root)
      return Promise.resolve([...entities])
        .map(entity => flac.fsEntitiesIntoBundles(entity, groups), {concurrency: 4})
        .then(bundles => {
          const trackSets = flac.bundlesIntoTrackSets(bundles)
          const albums = flac.trackSetsIntoAlbums([...trackSets.values()])
          const sorted = [...albums.values()]
          sorted.sort(byDate)
          log.silly('scanAlbums', 'sorted', sorted.map(a => '[' + a.date + '] ' + a.name))

          return [root, sorted]
        })
    })
}

module.exports = scanAlbums
