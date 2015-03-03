const promisify = require('bluebird').promisify

const {dirname, extname} = require('path')
const stat = promisify(require('fs').stat)

const log = require('npmlog')

const Cover = require('../models/cover.js')
const flac = require('./flac.js')
const trackers = require('../trackers.js')
const unzip = require('../zip-utils.js').unpack

function extractRelease (filename, tmpdir, covers) {
  log.verbose('extractReleaseMetadata', 'archive:', filename)
  trackers.set(filename, log.newGroup('archive: ' + filename))

  return unzip(filename, tmpdir).then(list => {
    return Promise.all(
      [].concat(...list).map(e => {
        switch (extname(e)) {
          case '.flac':
            return flac.scan(filename, e)
          case '.jpg':
          case '.pdf':
          case '.png':
            return stat(filename).then(stats => new Cover(e, stats))
          default:
            log.error('extractReleaseMetadata', "don't recognize type of", filename)
            return Promise.resolve(new Error("don't recognize type of " + filename))
        }
      })
    ).then(list => {
      list.filter(e => e instanceof Cover)
          .forEach(c => {
            const directory = dirname(c.path)
            if (!covers.get(directory)) {
              log.silly('extractReleaseMetadata', 'creating image list for', directory)
              covers.set(directory, [])
            }
            log.silly('extractReleaseMetadata', 'cover', c)
            covers.get(directory).push(c)
          })
      return list.filter(e => !(e instanceof Cover || e instanceof Error))
    })
  })
}

module.exports = { extractRelease }
