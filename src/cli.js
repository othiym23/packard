#!/usr/bin/env node
const promisify = require('es6-promisify')

const {randomBytes, createHash} = require('crypto')
const {createReadStream} = require('fs')
const {join, basename, extname} = require('path')
const os = require('os')
const stat = promisify(require('fs').stat)

const glob = promisify(require('glob'))
const Decompressor = require('decompress-zip')
const FLAC = require('flac-parser')
const log = require('npmlog')
const mkdirp = promisify(require('mkdirp'))
const rimraf = promisify(require('rimraf'))
const untildify = require('untildify')

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
      const tracker = log.newItem('scanning', files.length)
      return Promise.all(
        files.map(f => extractReleaseMetadata(f).then(metadata => {
          log.verbose('extracted', f)
          tracker.completeWork(1)
          return metadata
        }))
      )
    }).then(m => {
      log.disableProgress()
      log.info('metadata', m)
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

function unpackFile (filename, directory = tmpdir) {
  const tracker = log.newItem('unpacking: ' + basename(filename), 2)
  const path = join(tmpdir, createHash('sha1').update(filename).digest('hex'))
  return mkdirp(path).then(() => new Promise((resolve, reject) => {
    log.verbose('unpackFile', 'made', path)
    new Decompressor(filename)
          .on('error', reject)
          .on('progress', (i, t) => {
            if (i === 0) tracker.addWork(t)
            tracker.completeWork(1)
          })
          .on(
            'extract',
            l => resolve(
              l.map(e => e.deflated).filter(Boolean).map(e => join(path, e))
            )
          )
          .extract({path})
  }))
}

function readMetadata (filename) {
  log.verbose('readMetadata', 'extracting from', filename)
  return stat(filename).then(stats => new Promise((resolve, reject) => {
    const tag = {filename}
    const tracker = log.newStream(
      'metadata: ' + basename(filename),
      stats.size,
      3
    )
    createReadStream(filename)
      .pipe(tracker)
      .pipe(new FLAC())
      .on('data', d => tag[d.type] = d.value)
      .on('error', reject)
      .on('finish', () => resolve(tag))
  }))
}

function extractReleaseMetadata (filename) {
  return unpackFile(filename).then(list => {
    log.verbose('extractReleaseMetadata', 'files', list)
    return Promise.all(
      [].concat(...list)
       .filter(e => extname(e) === '.flac')
       .map(e => readMetadata(e))
    )
  })
}
