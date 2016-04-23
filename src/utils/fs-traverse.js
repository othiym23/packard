import fs from 'graceful-fs'
import { resolve } from 'path'

import { promisify } from 'bluebird'

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

export default function traverse (path, prune, visit) {
  if (prune(path)) return

  return stat(path).then((stats) => {
    if (stats.isDirectory()) {
      return readdir(path)
               .map((e) => traverse(resolve(path, e), prune, visit))
               .filter((e) => e)
    } else if (stats.isFile()) {
      return visit(path, stats)
    } else {
      throw new Error(path + ' is an unsupported thing.')
    }
  })
}
