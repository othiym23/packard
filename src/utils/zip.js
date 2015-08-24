const Promise = require('bluebird')
const promisify = Promise.promisify

const { createHash } = require('crypto')
const { createWriteStream } = require('graceful-fs')
const { join, basename, dirname } = require('path')
const stat = promisify(require('graceful-fs').stat)

const log = require('npmlog')
const mkdirp = promisify(require('mkdirp'))
const openZip = promisify(require('yauzl').open)

import Archive from '../models/archive.js'

function unpack (archivePath, groups, directory) {
  log.silly('unpack', 'unpacking', archivePath)
  const path = join(directory, createHash('sha1').update(archivePath).digest('hex'))
  const group = groups.get(archivePath)
  return mkdirp(path).then(() => stat(path)).then(stats => new Promise((resolve, reject) => {
    log.verbose('unpack', 'made', path)
    openZip(archivePath, {autoClose: false}).then(zf => {
      log.verbose('unpack', 'unpacking up to', zf.entryCount, 'entries')
      const entries = []

      const tracker = group.newItem(
        'scanning: ' + basename(archivePath),
        zf.entryCount,
        1
      )

      zf.on('error', reject)
      zf.on('entry', entry => {
        tracker.completeWork(1)

        if (/\/$/.test(entry.fileName)) {
          log.silly('unpack', 'skipping directory', entry.fileName)
          return
        }

        groups.set(
          basename(entry.fileName),
          group.newGroup('extract: ' + entry.fileName)
        )
        entries.push(entry)
      })
      zf.on('end', () => {
        Promise.map(entries, zipData => new Promise((resolve, reject) => {
          log.silly('unpack', 'zipData', zipData)
          const sourceArchive = new Archive(archivePath, stats, zipData)

          const fullPath = join(path, zipData.fileName)
          const writeTracker = groups.get(basename(zipData.fileName)).newStream(
            'writing: ' + zipData.fileName,
            zipData.uncompressedSize,
            3
          )

          zf.openReadStream(zipData, function (err, zipstream) {
            if (err) {
              log.error('unpack', 'reading stream', err.stack)
              return reject(err)
            }

            log.verbose('unpack', 'creating directory', dirname(fullPath))
            mkdirp(dirname(fullPath)).then(() => {
              log.verbose('unpack', 'writing', fullPath, zipData.uncompressedSize)
              zipstream
                .pipe(writeTracker)
                .pipe(createWriteStream(fullPath))
                .on('error', reject)
                .on('finish', () => {
                  log.verbose('unpack', 'finished writing', fullPath)
                  resolve({ sourceArchive, path: fullPath })
                })
            })
          })
        }), {concurrency: 1}).then(paths => {
          log.silly('unpack', 'unpacked', archivePath, 'to', paths)
          resolve(paths)
        })
      })
    }).catch(reject)
  }))
}

module.exports = { unpack }
