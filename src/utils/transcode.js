import { basename, extname, join } from 'path'
import { spawn } from 'child_process'

import mkdirpCB from 'mkdirp'
import validate from 'aproba'
import whichCB from 'which'
import Bluebird from 'bluebird'
import { fingerprint64 } from 'farmhash'

const mkdirp = Bluebird.promisify(mkdirpCB)
const which = Bluebird.promisify(whichCB)

export default function transcode (track, destination, encoder, profile) {
  validate('OSSS', arguments)

  // ensure we've been given a FLAC
  if (extname(track.file.path) !== '.flac') {
    throw new TypeError('Transcode only FLAC files, for now.')
  }

  return Bluebird.all([which('flac'), which(encoder)]).then(([flac, encoder]) => {
    const work = join(destination, fingerprint64(basename(track.file.path, '.flac')) + '.mp3')

    // start FLAC decoding
    const decode = spawn(
      flac,
      [
        '-d', // decode (default is encode)
        '-c', // send output to stdout
        track.file.path
      ],
      {
        stdio: ['ignore', 'pipe', 'inherit']
      }
    )

    // ensure destination exists
    return mkdirp(destination).then(() => {
      // start MP3 encoding
      const encode = spawn(
        encoder,
        [
          profile,
          '-', // read from stdin
          work // working directory
        ],
        {
          stdio: ['pipe', 'inherit', 'inherit']
        }
      )

      // connect the two
      decode.stdout.pipe(encode.stdin)

      return new Bluebird((resolve, reject) => {
        decode.on('error', reject)
        encode.on('error', reject)
        encode.on('exit', () => resolve(work))
      })
    })
  })

  // when that's done, tag it
  // and give it its final name
}
