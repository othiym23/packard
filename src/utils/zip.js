import fs from 'fs'
import { createHash } from 'crypto'
import { createWriteStream } from 'graceful-fs'
import { join, basename, dirname } from 'path'

import log from 'npmlog'
import mkdirpCB from 'mkdirp'
import { open as openZipCB } from 'yauzl'
import { promisify } from 'bluebird'
import Promise from 'bluebird'

import { Archive } from '@packard/model'

const stat = promisify(fs.stat)
const mkdirp = promisify(mkdirpCB)
const openZip = promisify(openZipCB)

export function unpack (archivePath, groups, directory) {
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
          const sourceArchive = new Archive(archivePath, stats, { info: zipData })

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
