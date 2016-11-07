import { exec as execCB } from 'child_process'

import log from 'npmlog'
import validate from 'aproba'
import whichCB from 'which'
import Bluebird from 'bluebird'

const exec = Bluebird.promisify(execCB)
const which = Bluebird.promisify(whichCB)

import escapePath from '../../utils/escape-path.js'

const map = new Map([
  ['album', '-A'],
  ['artist', '-a'],
  ['title', '-t'],
  ['index', '-n'],
  ['date', '--release-date']
])

export default function tag (track, path) {
  validate('OS', arguments)

  return which('eyeD3').then(function (eyeD3) {
    const options = toEyeD3(track)
    const command = [
      eyeD3,
      '--to-v2.4',
      ...options,
      escapePath(path)
    ].join(' ')

    log.verbose('mp3.tag', 'calling', command)
    return exec(command)
  })
}

function toEyeD3 (track) {
  let options = []

  copyTags(track, options)
  // TODO: add the rest of the tagging

  return options
}

function copyTags (track, options) {
  const tags = track.tags
  for (let key in tags) {
    const option = map.get(key)
    if (!option) {
      log.warn('copyTags', 'unknown standardized tag name', key)
    } else {
      options.push(`${option} '${escape(tags[key])}'`)
    }
  }
}

function escape (input) {
  return input.replace(/([:])/g, '\\$1')
              .replace(/(['])/g, "'\\''")
}
