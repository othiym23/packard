import { basename } from 'path'

import log from 'npmlog'
import Bluebird from 'bluebird'

import scanFLAC from '../flac/scan.js'

export default function inspect (files, groups) {
  log.silly('inspect', 'files', files)

  log.enableProgress()
  return Bluebird.map(files, f => {
    groups.set(basename(f), log.newGroup(f))
    return scanFLAC(f, groups)
  }).then(track => {
    log.disableProgress()
    console.log(JSON.stringify(track, null, 2))
  })
}
