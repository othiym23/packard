#!/usr/bin/env node
const promisify = require('es6-promisify')

const os = require('os')
const join = require('path').join
const randomBytes = require('crypto').randomBytes
const writeFile = promisify(require('fs').writeFile)

const glob = promisify(require('glob'))
const inify = require('ini').stringify
const log = require('npmlog')
const rimraf = promisify(require('rimraf'))
const untildify = require('untildify')

const flac = require('./metadata/flac.js')
const scanArtists = require('./artists.js')
const extractRelease = require('./metadata/index.js').extractRelease

const configPath = untildify('~/.packardrc')
const config = require('rc')(
  'packard',
  {
    loglevel: 'info',
    roots: [],
    'staging-directory': undefined,
    archive: {
      'enabled-by-default': false,
      'glob-pattern': undefined,
      'root': undefined
    }
  },
  [] // don't want rc interpreting argv
)

function saveConfig (argv) {
  log.verbose('saveConfig', 'saving to', configPath)
  const toSave = JSON.parse(JSON.stringify({
    loglevel: argv.loglevel,
    roots: argv.root,
    'staging-directory': argv.staging,
    archive: {
      'enabled-by-default': argv.archive,
      'glob-pattern': argv.pattern,
      root: argv.archiveRoot
    }
  }))
  log.verbose('saveConfig', 'config', toSave)
  return writeFile(configPath, inify(toSave))
}

const yargs = require('yargs')
                .usage('Usage: $0 [options] <command>')
                .command(
                  'unpack',
                  'unpack a set of zipped files into a staging directory'
                )
                .command('artists', 'generate a list of artists from roots')
                .option('S', {
                  alias: 'save-config',
                  describe: "save this run's configuration to ~/.packardrc",
                  boolean: true,
                  default: false
                })
                .option('loglevel', {
                  describe: 'logging level',
                  default: config.loglevel
                })
                .help('h')
                .alias('h', 'help')
                .version(() => require('../package').version)
                .demand(1)

const options = {
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
    default: config.archive['glob-pattern']
  },
  s: {
    alias: 'staging',
    describe: 'where to create the tree for unpacked artists',
    required: 'must have a place to put unpacked files',
    default: config['staging-directory']
  },
  archive: {
    describe: 'after other operations, archive original files',
    boolean: true,
    default: config.archive['enabled-by-default']
  },
  archiveRoot: {
    describe: "where to archive zip files once they've been unpacked",
    default: config.archive.root
  }
}

const covers = new Map()
const tmpdir = join(os.tmpdir(), 'packard-' + randomBytes(8).toString('hex'))
log.level = yargs.argv.loglevel

log.verbose('config', config)

let argv
switch (yargs.argv._[0]) {
  case 'artists':
    options.R.describe = 'directory root for an Artist/Album tree'
    argv = yargs.reset()
                .options({
                  R: options.R
                })
                .argv
    const roots = argv.R.map(r => untildify(r))
    log.silly('artists', 'argv', argv)

    scanArtists(roots).then(sorted => {
      for (let a of sorted) {
        console.log('%s [%sM]', a.name, a.getSize(1024 * 1024))
      }
    }).catch(error => log.error('scanArtists', error.stack))
    break
  case 'unpack':
    options.R.describe = 'root directory containing zipped files'
    argv = yargs.reset()
                .usage('Usage: $0 [options] unpack [zipfile [zipfile...]]')
                .options({
                  s: options.s,
                  R: options.R,
                  P: options.P,
                  'archive': options.archive,
                  'archive-root': options.archiveRoot
                })
                .check(argv => {
                  if (argv._.length > 1 || argv.R.length && argv.P) return true

                  return 'must pass either 1 or more zipfiles or root and glob pattern.'
                })
                .argv

    const files = argv._.slice(1)
    log.silly('unpack', 'argv', argv)

    let finish = unpack(files, argv.R[0], argv.P)
    if (argv.saveConfig) finish = finish.then(() => saveConfig(argv))
    return finish.catch(e => log.error('unpack', e.stack))
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

  return locate.then(files => {
    log.verbose('unpack', 'files', files)
    return Promise.all(files.map(f => extractRelease(f, tmpdir, covers)))
  }).then(m => {
    log.disableProgress()
    flac.albumsFromTracks(m, covers)
    log.verbose('removing', tmpdir)
    return rimraf(tmpdir)
  }).catch(error => {
    log.disableProgress()
    log.error('unpack', error.stack)
    log.verbose('not removing', tmpdir)
  })
}
