import Bluebird from 'bluebird'

import traverse from './fs-traverse.js'

export default function find (entries) {
  const files = new Set()
  return Bluebird.map(
    entries,
    e => traverse(e, p => files.add(p))
  ).return(files)
}
