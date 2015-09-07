import { dirname, extname } from 'path'
import fs from 'graceful-fs'

import log from 'npmlog'
import { promisify } from 'bluebird'
import Promise from 'bluebird'

import scanFLAC from '../flac/scan.js'
import { unpack as unzip } from '../utils/zip.js'
import Cover from '../models/cover.js'
import File from '../models/cover.js'

const stat = promisify(fs.stat)

function scan (unpackedFiles, trackers) {
  return Promise.map(
    unpackedFiles,
    ({ path, sourceArchive }) => {
      switch (extname(path)) {
        case '.flac':
          return scanFLAC(path, trackers, { sourceArchive })
        case '.jpg':
        case '.pdf':
        case '.png':
          return stat(path).then(stats => new Cover(path, stats))
        case '.avi':
          return stat(path).then(stats => new File(path, stats))
        default:
          log.error('scan', "don't recognize type of", path)
          return new Error("don't recognize type of " + path)
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
