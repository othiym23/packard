#!/usr/bin/env node
const promisify = require('es6-promisify')

const {randomBytes, createHash} = require('crypto')
const {createReadStream, createWriteStream} = require('fs')
const {join, dirname, basename, extname} = require('path')
const os = require('os')
const stat = promisify(require('fs').stat)

const glob = promisify(require('glob'))
const FLAC = require('flac-parser')
const log = require('npmlog')
const mkdirp = promisify(require('mkdirp'))
const rimraf = promisify(require('rimraf'))
const untildify = require('untildify')
const openZip = promisify(require('yauzl').open)

const config = require('rc')(
  'packard',
  {
    roots: []
  },
  [] // don't want rc interpreting argv
)

const yargs = require('yargs')
                .usage('Usage: $0 [options] <command>')
                .help('h')
                .alias('h', 'help')
                .option('loglevel', {
                  describe: 'logging level',
                  default: 'info'
                })
                .command('artists', 'generate a list of artists from roots')
                .command('unpack', 'unpack a set of files into a staging directory')
                .version(() => require('../package').version)
                .demand(1)

const scanArtists = require('./artists.js')
const Track = require('./models/track.js')
const Album = require('./models/album-multi.js')

let options = {
  R: {
    alias: 'root',
    array: true,
    describe: 'directory root for an Artist/Album tree',
    required: 'must have at least one tree to scan',
    default: config.roots
  },
  P: {
    alias: 'pattern',
    describe: 'bash glob pattern used to match files under root',
    default: config.archivePattern
  },
  s: {
    alias: 'staging',
    describe: 'where to create the tree for unpacked artists',
    required: 'must have a place to put unpacked files'
  }
}

const tmpdir = join(os.tmpdir(), 'packard-' + randomBytes(8).toString('hex'))
log.level = yargs.argv.loglevel

switch (yargs.argv._[0]) {
  case 'artists':
    let roots = yargs.reset()
         .options({R: options.R})
         .argv
         .R.map(r => untildify(r))

    scanArtists(roots).then(sorted => {
      for (let a of sorted) {
        console.log('%s [%sM]', a.name, a.getSize(1024 * 1024))
      }
    }).catch(error => log.error('scanArtists', error.stack))
    break
  case 'unpack':
    const argv = yargs.reset()
          .options({R: options.R, P: options.P, s: options.s})
          .check(argv => argv._.length > 1 || !!argv.R.length && !!argv.P)
          .argv
    const files = argv._.slice(1)

    let locate = Promise.resolve(files)
    if (argv.P) locate = locate.then(files => {
      log.verbose('unpack', 'initial files', files)
      return glob(join(untildify(argv.R[0]), argv.P))
        .then(globbed => files.concat(globbed))
    })

    log.enableProgress()
    locate.then(files => {
      log.verbose('unpack', 'files', files)
      return Promise.all(files.map(f => extractReleaseMetadata(f)))
    }).then(m => {
      log.disableProgress()
      log.info('metadata', m)
      makeAlbums(m)
      log.verbose('removing', tmpdir)
      return rimraf(tmpdir)
    }).catch(error => {
      log.disableProgress()
      log.error('unpack', error.stack)
      log.verbose('not removing', tmpdir)
    })
    break
  default:
    yargs.showHelp()
    process.exit(1)
}

function makeAlbums (metadata) {
  const albums = new Map()
  const tracks = [].concat(...metadata)
  for (let track of tracks) {
    if (!albums.get(track.ALBUM)) albums.set(track.ALBUM, [])
    albums.get(track.ALBUM).push(track)
  }
  log.info('albums', Array.from(albums.keys()))

  const finished = new Set()
  for (let album of albums.keys()) {
    let artists = new Set()
    let tracks = new Set()
    let dirs = new Set()
    for (let track of albums.get(album)) {
      artists.add(track.ARTIST)
      dirs.add(dirname(track.filename))
      tracks.add(new Track(
        track.ARTIST,
        track.ALBUM,
        track.TITLE,
        track.stats
      ))
    }

    const minArtists = Array.from(artists.values())
    const minDirs = Array.from(dirs.values())
    if (minDirs.length > 1) log.warn('makeAlbums', 'minDirs too big', minDirs)

    let artist
    switch (minArtists.length) {
      case 1:
        artist = minArtists[0]
        break
      case 2:
        log.warn('makeAlbums', '2 artists found; assuming split')
        artist = minArtists[0] + ' / ' + minArtists[1]
        break
      default:
        artist = 'Various Artists'
    }
    finished.add(new Album(album, artist, minDirs[0], Array.from(tracks.values())))
  }

  log.info('makeAlbums', Array.from(finished.values()))
}

function unpackFile (filename, directory = tmpdir) {
  const tracker = trackers.get(filename).newItem('unpacking: ' + basename(filename), 0)
  const path = join(tmpdir, createHash('sha1').update(filename).digest('hex'))
  return mkdirp(path).then(() => new Promise((resolve, reject) => {
    log.verbose('unpackFile', 'made', path)
    openZip(filename).then(zf => {
      const paths = []
      log.verbose('unpackFile', zf.entryCount, 'entries to unpack')
      tracker.addWork(zf.entryCount)
      zf.on('error', reject)
      zf.on('entry', entry => {
        tracker.completeWork(1)
        if (/\/$/.test(entry.fileName)) {
          log.verbose('unpackFile', 'skipping directory', entry.fileName)
          return
        }

        log.silly('unpackFile', 'entry', entry)
        const extractPath = join(path, entry.fileName)
        const writeTracker = log.newStream(
          'writing: ' + basename(extractPath),
          entry.uncompressedSize
        )
        zf.openReadStream(entry, function (err, zipstream) {
          if (err) return reject(err)
          log.verbose('unpackFile', 'writing', extractPath, entry.uncompressedSize)
          zipstream.pipe(writeTracker)
                   .pipe(createWriteStream(extractPath))
                   .on('error', reject)
                   .on('finish', () => {
                     log.verbose('unpackFile', 'finished writing', extractPath)
                     paths.push(extractPath)
                   })
        })
      })
      zf.on('close', () => {
        log.silly('unpackFile', 'resolving', filename, 'with', paths)
        resolve(paths)
      })
    })
  }))
}

function readMetadata (sourceArchive, filename) {
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

const trackers = new Map()

function extractReleaseMetadata (filename) {
  trackers.set(filename, log.newGroup('archive: ' + filename))

  return unpackFile(filename).then(list => {
    log.verbose('extractReleaseMetadata', 'files', list)
    return Promise.all(
      [].concat(...list)
       .filter(e => extname(e) === '.flac')
       .map(e => readMetadata(filename, e))
    )
  })
}
