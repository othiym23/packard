const promisify = require('es6-promisify')

const basename = require('path').basename
const createReadStream = require('fs').createReadStream
const stat = promisify(require('fs').stat)

const FLAC = require('flac-parser')
const log = require('npmlog')

const trackers = require('../trackers.js')

function scan (sourceArchive, filename) {
  log.verbose('readMetadata', 'extracting from', filename)
  return stat(filename).then(stats => new Promise((resolve, reject) => {
    const tag = {filename, stats}
    const tracker = trackers.get(sourceArchive).newStream(
      'metadata: ' + basename(filename),
      stats.size
    )
    createReadStream(filename)
      .pipe(tracker)
      .pipe(new FLAC())
      .on('data', d => tag[d.type] = d.value)
      .on('error', reject)
      .on('finish', () => resolve(tag))
  }))
}

module.exports = {scan}
