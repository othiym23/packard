import toModel from './path-to-model.js'
import traverse from './utils/fs-traverse.js'

export default function readTracks (root) {
  return traverse(root, toModel)
}
