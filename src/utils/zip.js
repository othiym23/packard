import { basename, dirname, extname, join } from 'path'
import { createHash } from 'crypto'
import { createWriteStream, stat as statCB } from 'graceful-fs'

import log from 'npmlog'
import mkdirpCB from 'mkdirp'
import validate from 'aproba'
import Bluebird from 'bluebird'
import { open as openZipCB } from 'yauzl'

import cruft from './cruft.js'
import reader from '../metadata/reader.js'
import { Archive } from '@packard/model'

import { promisify } from 'bluebird'
const stat = promisify(statCB)
const mkdirp = promisify(mkdirpCB)
const openZip = promisify(openZipCB)

export function unpack (archivePath, progressGroups, targetPath) {
  validate('SOS', arguments)

  const notFlac = {} // sentinel
  const name = basename(archivePath)
  let gauge = progressGroups.get(name)
  if (!gauge) {
    gauge = log.newGroup(name)
    progressGroups.set(name, gauge)
  }
  const unpacked = join(targetPath, createHash('sha1').update(archivePath).digest('hex'))

  gauge.silly('unpack', 'unpacking', archivePath, 'to', unpacked)
  const getArchiveStats = mkdirp(unpacked).return(archivePath).then(stat)

  return getArchiveStats.then(stats => new Bluebird((resolve, reject) => {
    openZip(archivePath, { autoClose: false }).then(archive => {
      gauge.silly('unpack', 'unpacking up to', archive.entryCount, 'entries')
      const entries = []
      const unzipGauge = gauge.newItem('scanning: ' + name, archive.entryCount, 1)
      const sourceArchive = new Archive(archivePath, stats, { info: archive })

      archive.on('error', reject)
      archive.on('entry', enqueue)
      archive.on('end', () => {
        // yauzl can't handle multiple entries being read at once
        Bluebird.map(entries, eachEntry, {concurrency: 1})
          .then(extracted => {
            gauge.silly('unpack', 'unpacked', archivePath, 'to', extracted)
            resolve(extracted)
          })
      })

      function enqueue (entry) {
        const filename = basename(entry.fileName)
        if (/\/$/.test(entry.fileName)) {
          gauge.verbose('unpack', 'skipping directory', entry.fileName)
        } else if (cruft.has(filename) || cruft.has(entry.fileName.split('/')[0])) {
          gauge.verbose('unpack', 'skipping cruft', entry.fileName)
        } else {
          progressGroups.set(filename, gauge.newGroup('extract: ' + entry.fileName))
          entries.push(entry)
        }

        unzipGauge.completeWork(1)
      }

      function eachEntry (metadata) {
        return new Bluebird((resolve, reject) => {
          gauge.silly('unpack', 'zip metadata', metadata)

          const scanned = {}
          function both (metadata) {
            if (metadata.track) scanned.extractedTrack = metadata.track
            if (metadata.path) scanned.path = metadata.path

            if (scanned.extractedTrack && scanned.path) {
              if (scanned.extractedTrack === notFlac) delete scanned.extractedTrack
              scanned.sourceArchive = sourceArchive
              resolve(scanned)
            }
          }

          archive.openReadStream(metadata, function (err, zipStream) {
            if (err) {
              gauge.error('unpack', 'reading stream', metadata)
              return reject(err)
            }

            const path = join(unpacked, metadata.fileName)
            const directory = dirname(path)
            gauge.silly('unpack', 'creating directory', directory)
            mkdirp(directory).then(() => {
              pipeToFile(zipStream, metadata, path, both, reject)

              const type = extname(path)
              if (type === '.flac' || type === '.mp3' || type === '.m4a') {
                pipeToMetadataReader(zipStream, metadata, path, both, reject)
              } else {
                both({ track: notFlac })
              }
            })
          })
        })
      }
    })
  }))

  function pipeToFile (zipStream, md, path, onFinish, onError) {
    validate('OOSFF', arguments)

    gauge.verbose('unpack', 'writing', path, md.uncompressedSize)
    const filename = basename(md.fileName)
    const writeGauge = progressGroups.get(filename).newStream(
      'writing: ' + path,
      md.uncompressedSize,
      3
    )
    zipStream
      .pipe(writeGauge)
      .on('error', onError)
      .pipe(createWriteStream(path))
      .on('error', onError)
      .on('finish', () => {
        gauge.verbose('unpack', 'finished writing', path)
        onFinish({ path })
      })
  }

  function pipeToMetadataReader (zipStream, md, path, onFinish, onError) {
    validate('OOSFF', arguments)

    const zipStats = {
      size: md.uncompressedSize,
      atime: md.getLastModDate(),
      mtime: md.getLastModDate(),
      ctime: md.getLastModDate(),
      birthtime: md.getLastModDate(),
      uid: process.getuid(),
      gid: process.getgid()
    }
    zipStream.pipe(reader(
      { path: path, stats: zipStats },
      progressGroups,
      onFinish,
      onError
    ))
  }
}
