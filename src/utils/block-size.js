import { join, resolve } from 'path'
// someday this will be nonblocking again
import { pseudoRandomBytes } from 'crypto'
import { writeFile as writeFileCB, stat as statCB } from 'graceful-fs'

import mkdirpCB from 'mkdirp'
import rimrafCB from 'rimraf'
import validate from 'aproba'

import { promisify } from 'bluebird'
const mkdirp = promisify(mkdirpCB)
const rimraf = promisify(rimrafCB)
const stat = promisify(statCB)
const writeFile = promisify(writeFileCB)

export default function blockSizeFromPath (path) {
  validate('S', arguments)

  const base = resolve(path)
  const probe = join(
    base,
    'packzzz-test-' + pseudoRandomBytes(4).toString('hex')
  )
  return mkdirp(base)
    .then(() => writeFile(probe, 'lol'))
    .then(() => stat(probe))
    .then(stats => rimraf(probe).return(stats.blksize))
}
