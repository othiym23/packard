import { exec as execCB } from 'child_process'

import assert from 'assert'

import { promisify } from 'bluebird'
const exec = promisify(execCB)

function parsePOSIX (output) {
  const [
    dev,
    total,
    used,
    available,
    capacity,
    mountpoint
  ] = output.split('\n')[1].split(/\s+/)
  return {
    dev,
    total: parseInt(total, 10),
    used: parseInt(used, 10),
    available: parseInt(available, 10),
    capacity,
    mountpoint
  }
}

export default function freespace (path, platform = process.platform) {
  assert(typeof path === 'string', 'must include path')
  switch (platform) {
    case 'darwin':
      return exec('df -b ' + path).then(parsePOSIX)
    case 'linux':
      return exec('df -B 512 ' + path).then(parsePOSIX)
    default:
      throw new Error(
        'Not yet implemented for ' + platform +
          ' -- care to lend a hand?'
      )
  }
}
