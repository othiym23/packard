import { createReadStream, stat as statCB } from 'graceful-fs'

import Bluebird from 'bluebird'
import log from 'npmlog'

import reader from './reader.js'

import { promisify } from 'bluebird'
const stat = promisify(statCB)

export default function scan (path, progressGroups, extras = {}) {
  log.verbose('scan', 'scanning', path)

  return stat(path).then(stats => new Bluebird((resolve, reject) => {
    extras.stats = stats

    return createReadStream(path).pipe(reader(
      path,
      progressGroups,
      extras,
      metadata => resolve(metadata.track), // strip off shell for backwards compat
      reject
    ))
  }))
}
