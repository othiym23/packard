import find from './find.js'
import isCruft from '../utils/cruft.js'
import toModel from './to-model.js'

export default function readModels (root) {
  const metadata = new Set()

  return find(
    root,
    isCruft,
    (m, stats) => metadata.add(toModel(m, stats))
  ).return(metadata)
}
