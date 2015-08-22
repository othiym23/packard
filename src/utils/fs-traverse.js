const promisify = require('bluebird').promisify

const readdir = promisify(require('graceful-fs').readdir)
const stat = promisify(require('graceful-fs').stat)

import { resolve } from 'path'

const cruft = [
  '.DS_Store',    // OS X metadata is very cluttery
  '.AppleDouble', // see above
  '.localized',   // OS X localization
  'Thumbs.db',    // yes, I do run Windows sometimes
  '.Parent'       // I have no idea
]

export default function traverse (root, visit) {
  return readdir(root)
           .filter(e => cruft.indexOf(e) === -1)
           .map(e => {
             const path = resolve(root, e)
             return stat(path).then(stats => {
               if (stats.isDirectory()) return traverse(path, visit)
               else if (stats.isFile()) return visit(path, stats)
               else throw new Error(path + ' is an unsupported thing.')
             })
           })
}
