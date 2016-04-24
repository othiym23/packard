// filter variant record types by field names
export default function findTypes (set, types) {
  const foundMap = new Map()
  for (let type of types) {
    foundMap.set(type, new Set())
  }

  for (let info of set) {
    for (let type of types) {
      if (info[type]) foundMap.get(type).add(info)
    }
  }
  return foundMap
}

