#!/usr/bin/env node
const promisify = require('es6-promisify')

const {randomBytes} = require('crypto')
const {join, extname} = require('path')
const os = require('os')

const glob = promisify(require('glob'))
const log = require('npmlog')
const rimraf = promisify(require('rimraf'))
const untildify = require('untildify')

const flac = require('./metadata/flac.js')
const scanArtists = require('./artists.js')
const trackers = require('./trackers.js')
const unzip = require('./zip-utils.js').unpack

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
  },
  archive: {
    describe: 'after other operations, archive original files'
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

    return unpack(files, argv.R[0], argv.P)
  default:
    yargs.showHelp()
    process.exit(1)
}

function unpack (files, root, pattern) {
  log.enableProgress()
  let locate = Promise.resolve(files)
  if (pattern) locate = locate.then(files => {
    log.verbose('unpack', 'initial files', files)
    return glob(join(untildify(root), pattern))
      .then(globbed => files.concat(globbed))
  })

  locate.then(files => {
    log.verbose('unpack', 'files', files)
    return Promise.all(files.map(f => extractReleaseMetadata(f)))
  }).then(m => {
    log.disableProgress()
    flac.albumsFromTracks(m)
    log.verbose('removing', tmpdir)
    return rimraf(tmpdir)
  }).catch(error => {
    log.disableProgress()
    log.error('unpack', error.stack)
    log.verbose('not removing', tmpdir)
  })
}

function extractReleaseMetadata (filename) {
  log.verbose('extractReleaseMetadata', 'archive:', filename)
  trackers.set(filename, log.newGroup('archive: ' + filename))

  return unzip(filename, tmpdir).then(list => {
    log.verbose('extractReleaseMetadata', 'files', list)
    return Promise.all(
      [].concat(...list)
       .filter(e => extname(e) === '.flac')
       .map(e => flac.scan(filename, e))
    )
  })
}
