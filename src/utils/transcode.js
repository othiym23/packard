import { basename, extname, join } from 'path'
import { spawn } from 'child_process'

import log from 'npmlog'
import mkdirpCB from 'mkdirp'
import mvCB from 'mv'
import validate from 'aproba'
import whichCB from 'which'
import Bluebird from 'bluebird'
import { fingerprint64 } from 'farmhash'
import { concat, pipe } from 'mississippi'

const mkdirp = Bluebird.promisify(mkdirpCB)
const mv = Bluebird.promisify(mvCB)
const which = Bluebird.promisify(whichCB)

import tag from '../metadata/mp3/tag.js'

export default function transcode (track, destination, encoder, profile) {
  validate('OSSS', arguments)

  // ensure we've been given a FLAC
  if (extname(track.file.path) !== '.flac') {
    throw new TypeError('Transcode only FLAC files, for now.')
  }

  const working = join(destination, fingerprint64(basename(track.file.path, '.flac')) + '.mp3')
  const final = join(destination, basename(track.file.path, '.flac') + '.mp3')

  const runTranscode = Bluebird.all([which('flac'), which(encoder)]).then(([flac, encoder]) => {
    log.silly('transcode', 'flac binary lives at', flac)
    log.verbose('transcode', 'encoder binary lives at', encoder)

    // ensure destination exists
    mkdirp(destination).then(() => {
      // then run a streaming transcode
      // TODO: get progress tracking in here
      return new Bluebird((resolve, reject) => {
        const decode = spawn(
          flac,
          [
            '-d', // decode (default is encode)
            '-c', // send output to stdout
            track.file.path
          ],
          {}
        )

        pipe(decode.stderr, concat({ encoding: 'string' }, function (output) {
          if (output) log.silly('transcode.decode', output)
        }))

        const encode = spawn(
          encoder,
          [
            profile, // defaults to -V0
            '-', // read from stdin
            working
          ],
          {}
        )

        pipe(encode.stdout, concat({ encoding: 'string' }, function (output) {
          if (output) log.silly('transcode.encode stdout', output)
        }))

        pipe(encode.stderr, concat({ encoding: 'string' }, function (output) {
          if (output) log.silly('transcode.encode stderr', output)
        }))

        pipe(decode.stdout, encode.stdin, function (err) {
          if (err) return reject(err)

          resolve()
        })
      })
    })
  })

  // when that's done, tag it
  const tagWorking = runTranscode.then(() => tag(track, working))

  // and give it its final name
  return tagWorking
    .then(() => mv(working, final))
    .then(() => {
      track.file.path = final
      return final // aw, c'mon, standard
    })
}
