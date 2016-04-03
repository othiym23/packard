import { basename, dirname, extname, join } from 'path'
import { createHash } from 'crypto'
import { createWriteStream, stat as statCB } from 'graceful-fs'

import log from 'npmlog'
import mkdirpCB from 'mkdirp'
import validate from 'aproba'
import Bluebird from 'bluebird'
import { open as openZip } from 'yauzl'

import isCruft from './cruft.js'
import reader from '../metadata/reader.js'
import { Archive } from '@packard/model'

import { promisify } from 'bluebird'
const stat = promisify(statCB)
const mkdirp = promisify(mkdirpCB)

export function unpack (archivePath, progressGroups, targetPath) {
  validate('SOS', arguments)

  const name = basename(archivePath)
  let gauge = progressGroups.get(name)
  if (!gauge) {
    gauge = log.newGroup(name)
    progressGroups.set(name, gauge)
  }

  const unpacked = join(targetPath, createHash('sha1').update(archivePath).digest('hex'))

  return Bluebird.join(
    mkdirp(unpacked),
    stat(archivePath)
  ).spread((p, stats) => new Bluebird((resolve, reject) => {
    gauge.verbose('unzip', 'unpacking', archivePath, 'to', unpacked)
    // openZip can't be promisified because the object stream it yields doesn't
    // start paused.
    openZip(archivePath, { autoClose: false }, (err, archive) => {
      if (err) return reject(err)

      let entryCount = archive.entryCount
      gauge.verbose('unzip', 'extracting up to', entryCount, 'entries')
      function examined (message, path) {
        entryCount--
        unzipGauge.completeWork(1)
        gauge.verbose('unzip.enqueue', message, path, '(' + entryCount + ' entries remaining)')
      }

      const sourceArchive = new Archive(archivePath, stats, { info: archive })
      const unzipGauge = gauge.newItem('scanning: ' + name, archive.entryCount, 1)
      const entries = []

      archive.on('error', reject)
      archive.on('entry', enqueue)
      archive.on('end', () => {
        gauge.verbose('unzip.enqueue', 'finished scanning archive table of contents')
        Bluebird.all(entries).then((extracted) => {
          gauge.verbose('unzip', 'extracted', extracted.length, 'files from', archivePath)
          resolve(extracted)
        })
      })

      function enqueue (entry) {
        gauge.silly('unzip.enqueue', 'examining', entry.fileName)
        const filename = basename(entry.fileName)
        if (/\/$/.test(entry.fileName)) {
          examined('skipped directory', entry.fileName)
        } else if (isCruft(filename) || isCruft(entry.fileName.split('/')[0])) {
          examined('skipped cruft', entry.fileName)
        } else {
          progressGroups.set(filename, gauge.newGroup('extract: ' + entry.fileName))
          entries.push(extract(entry))
          examined('extracting', basename(entry.fileName))
        }
      }

      function extract (metadata) {
        const path = join(unpacked, metadata.fileName)
        const directory = dirname(path)
        return mkdirp(directory).then(() => new Bluebird((resolve, reject) => {
          gauge.silly('unzip.extract', 'created directory', directory)

          archive.openReadStream(metadata, function (err, zipStream) {
            if (err) {
              gauge.error('unzip.extract', 'reading stream', metadata)
              return reject(err)
            }

            const notFlac = {} // sentinel
            const scanned = { sourceArchive }
            function both ({ track, path }) {
              if (track) scanned.extractedTrack = track
              if (path) scanned.path = path

              if (scanned.extractedTrack && scanned.path) {
                if (scanned.extractedTrack === notFlac) delete scanned.extractedTrack
                gauge.silly(
                  'unzip.extract.both', scanned.path, 'written',
                  scanned.extractedTrack ? 'and tags read' : ''
                )
                resolve(scanned)
              }
            }

            const type = extname(path)
            if (type === '.flac' || type === '.mp3' || type === '.m4a') {
              zipStream.pipe(toMetadataReader(metadata, path, both, reject))
            } else {
              both({ track: notFlac })
            }

            zipStream.pipe(toUncompressedFile(metadata, path, both, reject))
          })
        }))
      }
    })
  }))

  function toUncompressedFile (md, path, onFinish, onError) {
    validate('OSFF', arguments)

    gauge.silly('unzip.toUncompressedFile', 'writing', path, '(' + md.uncompressedSize + 'B)')

    const filename = basename(md.fileName)
    const writeGauge = progressGroups.get(filename).newStream(
      'writing: ' + path,
      md.uncompressedSize,
      3
    ).on('error', onError)

    const extracted = createWriteStream(path)
      .on('error', onError)
      .on('finish', () => {
        gauge.verbose('unzip.toUncompressedFile', 'wrote', path)
        onFinish({ path })
      })

    writeGauge.pipe(extracted)

    return writeGauge
  }

  function toMetadataReader (md, path, onFinish, onError) {
    validate('OSFF', arguments)

    const zipStats = {
      size: md.uncompressedSize,
      atime: md.getLastModDate(),
      mtime: md.getLastModDate(),
      ctime: md.getLastModDate(),
      birthtime: md.getLastModDate(),
      uid: process.getuid(),
      gid: process.getgid()
    }

    return reader(
      { path: path, stats: zipStats },
      progressGroups,
      onFinish,
      onError
    )
  }
}
