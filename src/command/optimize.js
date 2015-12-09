import { resolve as optimize } from 'knapsack-js'
import log from 'npmlog'

import { scanAlbums } from './albums.js'

export default function optimizeAlbums (
  files = [],
  roots = [],
  blockSize,
  capacity) {
  const entities = files.concat(roots)
  log.enableProgress()
  log.silly('optimizeAlbums', 'entities', entities)
  return scanAlbums(entities)
    .then(albums => {
      log.disableProgress()
      calculate([...albums], blockSize, capacity)
    })
}

function calculate (albums, blockSize, capacity) {
  log.verbose('calculate', 'blockSize', blockSize, 'capacity', capacity)
  // used for displaying report
  const al = albums.reduce((c, a) => c.set(a.path, a), new Map())

  // used for difference calculation later
  const paths = new Set(al.keys())

  // knapsack-js wants a list of object literals, which is hard to get directly
  // from a map
  const sizes = albums.reduce(
    (c, a) => { c.push({ [a.path]: a.getSize(blockSize) }); return c },
    []
  )
  log.verbose('calculate', 'sizes', sizes)
  const optimized = optimize(capacity, sizes)
  log.verbose('calculate', 'optimized', optimized)
  const keepers = new Set(optimized.map(i => Object.keys(i)[0]))
  log.silly('calculate', 'keepers', keepers)
  const leftovers = [...paths].filter(p => !keepers.has(p))
  log.silly('calculate', 'leftovers', leftovers)

  console.log('included:')
  let includedSize = 0
  for (let path of [...keepers].sort((a, b) => al.get(b).getSize(1) - al.get(a).getSize(1))) {
    const album = al.get(path)
    console.log('%s [%s blocks]', album.path, album.getSize(blockSize))
    includedSize += album.getSize(blockSize)
  }
  console.log(
    'TOTAL: %s %s-byte blocks (of %s block capacity)\n',
    includedSize, blockSize, capacity
  )

  console.log('left out:')
  let leftoverSize = 0
  for (let path of leftovers.sort((a, b) => al.get(b).getSize(1) - al.get(a).getSize(1))) {
    const album = al.get(path)
    console.log('%s [%s blocks]', album.path, album.getSize(blockSize))
    leftoverSize += album.getSize(blockSize)
  }
  console.log('TOTAL: %s %s-byte blocks', leftoverSize, blockSize)
}
