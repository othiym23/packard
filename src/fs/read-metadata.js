import findTypes from '../utils/find-types.js'
import readModels from './read-models.js'

export default function readMetadata (root) {
  return readModels(root).then((metadata) => {
    const foundMap = findTypes(metadata, ['fsTrack'])
    return foundMap.get('fsTrack')
  })
}
