import Bluebird from 'bluebird'

import isCruft from './cruft.js'
import traverse from './fs-traverse.js'

export default function find (entries) {
  const files = new Set()
  return Bluebird.map(
    entries,
    (e) => traverse(e, isCruft, (p) => files.add(p))
  ).return(files)
}
