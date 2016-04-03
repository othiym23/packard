import { basename } from 'path'

import log from 'npmlog'
import Bluebird from 'bluebird'

import scan from '../metadata/scan.js'

export default function inspect (files) {
  const progressGroups = new Map()
  log.silly('inspect', 'files', files)

  log.enableProgress()
  return Bluebird.map(files, (path) => {
    progressGroups.set(basename(path), log.newGroup(path))
    return scan({ path }, progressGroups)
  }).then((track) => {
    log.disableProgress()
    console.log(JSON.stringify(track, null, 2))
  })
}
