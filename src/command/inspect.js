import { basename } from 'path'

import log from 'npmlog'
import Bluebird from 'bluebird'

import scanFLAC from '../flac/scan.js'

export default function inspect (files) {
  const trackerGroups = new Map()
  log.silly('inspect', 'files', files)

  log.enableProgress()
  return Bluebird.map(files, f => {
    trackerGroups.set(basename(f), log.newGroup(f))
    return scanFLAC(f, trackerGroups)
  }).then(track => {
    log.disableProgress()
    console.log(JSON.stringify(track, null, 2))
  })
}
