import { dirname, extname } from 'path'
import fs from 'graceful-fs'

import log from 'npmlog'
import Bluebird from 'bluebird'

import scanFLAC from '../flac/scan.js'
import { unpack as unzip } from '../utils/zip.js'
import { Cover, File } from '@packard/model'

import { promisify } from 'bluebird'
const stat = promisify(fs.stat)

function scan (unpackedFiles, trackers) {
  return Bluebird.map(
    unpackedFiles,
    ({ path, sourceArchive, flacTrack }) => {
      switch (extname(path)) {
        case '.flac':
          if (flacTrack) {
            if (sourceArchive) flacTrack.sourceArchive = sourceArchive
            return Bluebird.resolve(flacTrack)
          } else {
            return scanFLAC(path, trackers, { sourceArchive })
          }
          break
        case '.jpg':
        case '.pdf':
        case '.png':
          return stat(path).then(stats => new Cover(path, stats))
        default:
          log.warn('scan', "don't recognize type of", path)
          return stat(path).then(stats => new File(path, stats))
      }
    }
  )
}

function populateImages (list, covers) {
  list.filter(e => e instanceof Cover)
      .forEach(c => {
        const directory = dirname(c.path)
        if (!covers.get(directory)) {
          log.silly('scan', 'creating image list for', directory)
          covers.set(directory, [])
        }
        log.silly('scan', 'cover', c)
        covers.get(directory).push(c)
      })

  return list
}

export function extractRelease (zipfile, tmpdir, covers, trackers) {
  log.verbose('extractReleaseMetadata', 'archive:', zipfile)

  return unzip(zipfile, trackers, tmpdir)
          .then(list => scan(list, trackers))
          .then(list => populateImages(list, covers))
          .then(list => list.filter(e => !(e instanceof Cover ||
                                           e instanceof Error)))
}
