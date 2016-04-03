import log from 'npmlog'
import { resolve as optimize } from 'knapsack-js'

export default function knapsackForAlbums (albums, capacity, blockSize) {
  log.verbose('knapsackForAlbums', 'capacity', capacity, 'blockSize', blockSize)
  const albumList = [...albums]
  // used for displaying report
  const al = albumList.reduce((c, a) => c.set(a.path, a), new Map())

  // used for difference calculation later
  const paths = new Set(al.keys())

  // knapsack-js wants a list of object literals, which is hard to get directly
  // from a map
  const sizes = albumList.map((a) => ({ [a.path]: a.getSize(blockSize) }))
  log.verbose('knapsackForAlbums', 'sizes', sizes)
  const optimized = optimize(capacity, sizes)
  log.verbose('knapsackForAlbums', 'optimized', optimized)
  const keepers = new Set(optimized.map((i) => Object.keys(i)[0]))
  log.silly('knapsackForAlbums', 'keepers', keepers)
  const leftovers = [...paths].filter((p) => !keepers.has(p))
  log.silly('knapsackForAlbums', 'leftovers', leftovers)

  return {
    included: [...keepers].map((p) => al.get(p)),
    discarded: leftovers.map((p) => al.get(p))
  }
}
