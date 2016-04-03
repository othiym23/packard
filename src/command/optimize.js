import log from 'npmlog'

import optimize from '../utils/knapsack-albums.js'
import { bySize } from '../utils/sort.js'
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
    .then((albums) => {
      log.disableProgress()
      calculate([...albums], blockSize, capacity)
    })
}

function calculate (albums, blockSize, capacity) {
  log.verbose('calculate', 'blockSize', blockSize, 'capacity', capacity)
  const { included, discarded } = optimize(albums, capacity, blockSize)

  console.log('included:')
  let includedSize = 0
  for (let album of included.sort(bySize)) {
    console.log('%s [%s blocks]', album.path, album.getSize(blockSize))
    includedSize += album.getSize(blockSize)
  }
  console.log(
    'TOTAL: %s %s-byte blocks (of %s block capacity)\n',
    includedSize, blockSize, capacity
  )

  console.log('left out:')
  let leftoverSize = 0
  for (let album of discarded.sort(bySize)) {
    console.log('%s [%s blocks]', album.path, album.getSize(blockSize))
    leftoverSize += album.getSize(blockSize)
  }
  console.log('TOTAL: %s %s-byte blocks', leftoverSize, blockSize)
}
