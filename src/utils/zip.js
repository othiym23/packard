import fs from 'graceful-fs'
import { createHash } from 'crypto'
import { createWriteStream } from 'graceful-fs'
import { join, basename, dirname, extname } from 'path'

import log from 'npmlog'
import mkdirpCB from 'mkdirp'
import { open as openZipCB } from 'yauzl'
import Bluebird from 'bluebird'

import cruft from './cruft.js'
import { Archive } from '@packard/model'
import reader from '../metadata/reader.js'

const stat = Bluebird.promisify(fs.stat)
const mkdirp = Bluebird.promisify(mkdirpCB)
const openZip = Bluebird.promisify(openZipCB)

export function unpack (archivePath, groups, directory) {
  log.silly('unpack', 'unpacking', archivePath)
  const path = join(directory, createHash('sha1').update(archivePath).digest('hex'))
  const group = groups.get(archivePath)
  return mkdirp(path).then(() => stat(path)).then(stats => new Bluebird((resolve, reject) => {
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

        if (cruft.has(basename(entry.fileName)) || cruft.has(entry.fileName.split('/')[0])) {
          log.verbose('unpack', 'skipping cruft', entry.fileName)
          return
        }

        groups.set(
          basename(entry.fileName),
          group.newGroup('extract: ' + entry.fileName)
        )
        entries.push(entry)
      })
      zf.on('end', () => {
        Bluebird.map(entries, zipData => new Bluebird((resolve, reject) => {
          log.silly('unpack', 'zipData', zipData)
          const sourceArchive = new Archive(archivePath, stats, { info: zipData })

          const fullPath = join(path, zipData.fileName)
          const writeTracker = groups.get(basename(zipData.fileName)).newStream(
            'writing: ' + zipData.fileName,
            zipData.uncompressedSize,
            3
          )

          const scanned = {}
          const notFlac = {}
          function both (metadata) {
            if (metadata.track) scanned.flacTrack = metadata.track
            if (metadata.sourceArchive) scanned.sourceArchive = metadata.sourceArchive
            if (metadata.path) scanned.path = metadata.path

            if (scanned.flacTrack && scanned.sourceArchive && scanned.path) {
              if (scanned.flacTrack === notFlac) delete scanned.flacTrack
              resolve(scanned)
            }
          }

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
                  both({ sourceArchive, path: fullPath })
                })

              const type = extname(fullPath)
              if (type === '.flac' || type === '.mp3' || type === '.m4a') {
                const zipStats = {
                  size: zipData.uncompressedSize,
                  atime: zipData.getLastModDate(),
                  mtime: zipData.getLastModDate(),
                  ctime: zipData.getLastModDate(),
                  birthtime: zipData.getLastModDate(),
                  uid: process.getuid(),
                  gid: process.getgid()
                }
                zipstream.pipe(reader(
                  fullPath,
                  groups,
                  { stats: zipStats },
                  both,
                  reject
                ))
              } else {
                both({ track: notFlac })
              }
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
