/*eslint-disable no-undef*/ // oh eslint
const Promise = require('bluebird')
/*eslint-enable no-undef*/

const promisify = Promise.promisify

const {createHash} = require('crypto')
const {createWriteStream} = require('fs')
const {join, basename} = require('path')

const log = require('npmlog')
const mkdirp = promisify(require('mkdirp'))
const openZip = promisify(require('yauzl').open)

const trackers = require('./trackers.js')

function unpack (filename, directory) {
  const path = join(directory, createHash('sha1').update(filename).digest('hex'))
  return mkdirp(path).then(() => new Promise((resolve, reject) => {
    log.verbose('unpackFile', 'made', path)
    openZip(filename).then(zf => {
      log.verbose('unpackFile', zf.entryCount, 'entries to unpack')
      let count = zf.entryCount
      const paths = []
      const tracker = trackers.get(filename)
                              .newItem('unpacking: ' + basename(filename), count, 2)

      zf.on('error', reject)
      zf.on('entry', entry => {
        if (/\/$/.test(entry.fileName)) {
          log.verbose('unpackFile', 'skipping directory', entry.fileName)
          --count
          return
        }

        log.silly('unpackFile', 'entry', entry)
        const extractPath = join(path, entry.fileName)
        const writeTracker = log.newStream(
          'writing: ' + basename(extractPath),
          entry.uncompressedSize,
          3
        )
        zf.openReadStream(entry, function (err, zipstream) {
          if (err) return reject(err)
          log.verbose('unpackFile', 'writing', extractPath, entry.uncompressedSize)
          zipstream
            .pipe(writeTracker)
            .pipe(createWriteStream(extractPath))
            .on('error', reject)
            .on('finish', () => {
              tracker.completeWork(1)
              log.verbose('unpackFile', 'finished writing', extractPath)
              paths.push(extractPath)
              if (paths.length === count) {
                log.silly('unpackFile', 'resolving', filename, 'with', paths)
                resolve(paths)
              }
            })
        })
      })
    })
  }))
}

module.exports = { unpack }
