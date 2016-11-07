import { exec as execCB } from 'child_process'

import assert from 'assert'
import Bluebird from 'bluebird'

import blockSizeFromPath from './block-size.js'
import escapePath from './escape-path.js'

const exec = Bluebird.promisify(execCB)

function parsePOSIX (output, blockBytes, platform) {
  const [header, values] = output.split('\n')
  switch (platform) {
    case 'darwin':
      assert(
        header.match(blockBytes + '-blocks'),
        'expect confirmation of block size'
      )
      break
    case 'linux':
      assert(
        header.match(blockBytes / 1024 + 'K-blocks'),
        'expect confirmation of block size'
      )
      break
    default:
      throw new Error(
        'Not yet implemented for ' + platform +
          ' -- care to lend a hand?'
      )
  }

  const [
    dev,
    total,
    used,
    available,
    capacity,
    mountpoint
  ] = values.split(/\s+/)
  return {
    dev,
    total: parseInt(total, 10),
    used: parseInt(used, 10),
    available: parseInt(available, 10),
    capacity,
    mountpoint
  }
}

export default function freeBlocksFromPath (path, blockBytes, platform = process.platform) {
  assert(typeof path === 'string', 'must include path')
  const escaped = escapePath(path)

  let command
  if (blockBytes) {
    command = Bluebird.resolve(blockBytes)
  } else {
    command = blockSizeFromPath(escaped)
  }

  switch (platform) {
    case 'darwin':
      const env = Object.create(process.env)
      return command.then((bytes) => {
        env.BLOCKSIZE = bytes
        return exec('df ' + escaped, { env })
          .then((output) => parsePOSIX(output, bytes, platform))
      })
    case 'linux':
      return command
        .then((bytes) => exec('df -B ' + bytes + ' ' + escaped)
          .then((blocks) => parsePOSIX(blocks, bytes, platform)))
    default:
      throw new Error(
        'Not yet implemented for ' + platform +
          ' -- care to lend a hand?'
      )
  }
}
