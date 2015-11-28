import fs from 'graceful-fs'
import { basename, resolve } from 'path'

import { promisify } from 'bluebird'

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

const cruft = new Set([
  '.DS_Store',    // OS X metadata is very cluttery
  '.AppleDouble', // see above
  '.localized',   // OS X localization
  'Thumbs.db',    // yes, I do run Windows sometimes
  '.Parent'       // I have no idea
])

export default function traverse (path, visit) {
  return stat(path).then(stats => {
    if (stats.isDirectory()) {
      return readdir(path)
               .map(e => traverse(resolve(path, e), visit))
               .filter(e => e)
    } else if (stats.isFile()) {
      if (!cruft.has(basename(path))) return visit(path, stats)
    } else {
      throw new Error(path + ' is an unsupported thing.')
    }
  })
}
