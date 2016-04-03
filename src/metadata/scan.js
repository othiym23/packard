import { createReadStream, stat as statCB } from 'graceful-fs'

import Bluebird from 'bluebird'
import log from 'npmlog'

import reader from './reader.js'

import { promisify } from 'bluebird'
const stat = promisify(statCB)

export default function scan (info, progressGroups) {
  const path = info.path
  log.verbose('scan', 'scanning', path)

  return stat(path).then((stats) => new Bluebird((resolve, reject) => {
    info.stats = stats

    return createReadStream(path).pipe(reader(
      info,
      progressGroups,
      (metadata) => resolve(metadata.track), // strip off shell for backwards compat
      reject
    ))
  }))
}
