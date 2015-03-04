#!/usr/bin/env node
/*eslint-disable no-undef*/ // oh eslint
const Promise = require('bluebird')
/*eslint-enable no-undef*/

const promisify = Promise.promisify

const os = require('os')
const {join, resolve} = require('path')
const randomBytes = require('crypto').randomBytes
const writeFile = promisify(require('fs').writeFile)

const glob = promisify(require('glob'))
const inify = require('ini').stringify
const log = require('npmlog')
const rimraf = promisify(require('rimraf'))
const untildify = require('untildify')

const {place, moveToArchive} = require('./mover.js')
const extractRelease = require('./metadata/index.js').extractRelease
const flac = require('./metadata/flac.js')
const scanArtists = require('./artists.js')

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
  // JSON.parse(JSON.Stringify()) is an easy way to clear out undefined values,
  // which ini will go ahead and save as the string "undefined", which is not
  // what I want.
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
                .command('inspect', 'dump all the metadata from a track or album')
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
    default: Boolean(config.archive['enabled-by-default'])
  },
  archiveRoot: {
    describe: "where to archive zip files once they've been unpacked",
    default: config.archive.root
  }
}

const covers = new Map()
const tmpdir = join(os.tmpdir(), 'packard-' + randomBytes(8).toString('hex'))
log.level = yargs.argv.loglevel
log.setGaugeTemplate([
  {type: 'name', separated: true, maxLength: 40, minLength: 40, align: 'left'},
  {type: 'spinner', separated: true},
  {type: 'startgroup'},
  {type: 'completionbar'},
  {type: 'endgroup'}
])
log.gauge.setTheme({
  startgroup: '╢',
  endgroup: '╟',
  complete: '█',
  incomplete: '░',
  spinner: '◴◷◶◵',
  subsection: '→'
})

log.verbose('config', config)

let argv
switch (yargs.argv._[0]) {
  case 'artists':
    options.R.describe = 'directory root for an Artist/Album tree'
    argv = yargs.reset()
                .options({
                  R: options.R
                })
                .check(argv => {
                  if (argv.R.length) return true

                  return 'must pass 1 or more root directories'
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

                  return 'must pass either 1 or more zipfiles or root and glob pattern'
                })
                .argv

    const files = argv._.slice(1)
    log.silly('unpack argv', argv)

    let finish = unpack(
      files,
      argv.s,
      argv.R[0], argv.P,
      argv.archive, argv.archiveRoot
    )
    if (argv.saveConfig) finish = finish.then(() => saveConfig(argv))
    return finish.catch(e => log.error('unpack', e.stack))
  case 'inspect':
    argv = yargs.reset()
                .usage('Usage: $0 [options] inspect [file [dir...]]')
                .demand(2)
                .argv

    const things = argv._.slice(1)
    log.silly('inspect', 'argv', argv)
    log.silly('inspect', 'things', things)

    log.enableProgress()
    const group = log.newGroup('inspect')
    Promise.all(things.map(t => flac.scan({fullPath: t}, group)))
           .then(ms => ms.forEach(m => log.info('metadata', m)))
           .catch(e => {
             log.disableProgress()
             log.error('inspect', e.stack)
           })
           .then(() => log.disableProgress())

    break
  default:
    yargs.showHelp()
    process.exit(1)
}

function unpack (files, staging, root, pattern, archive, archiveRoot) {
  log.enableProgress()
  let locate = Promise.resolve(files)
  if (root && pattern) locate = locate.then(files => {
    log.verbose('unpack', 'initial files', files)
    return glob(join(untildify(root), pattern))
      .then(globbed => {
        const full = files.concat(globbed)
        log.verbose('unpack', 'globbed files', full)
        if (!archiveRoot) return full
        // don't reprocess stuff that's already been archived
        return full.filter(f => resolve(f).indexOf(resolve(archiveRoot)) === -1)
      })
  })

  const groups = new Map()
  return locate.then(files => {
    if (files.length === 0) {
      log.info('unpack', 'no archives to process! CU L8R SAILOR')
      log.disableProgress()
      process.exit(0)
    }

    log.verbose('unpack', 'processing', files)
    files.forEach(f => groups.set(f, log.newGroup('process: ' + f)))
    return Promise.resolve(files).map(
      f => extractRelease(f, tmpdir, covers, groups),
      {concurrency: 2}
    )
  }).then(m => {
    return place(flac.albumsFromTracks(m, covers), staging, groups)
  }).then(placed => {
    if (!archive) return Promise.resolve(placed)
    return moveToArchive(placed, archiveRoot, groups).then(() => placed)
  }).then(albums => {
    log.disableProgress()
    report(albums, staging)
    if (archive) reportArchived(albums)
    log.silly('unpack', 'tracker debugging', log.tracker.debug())
    log.verbose('removing', tmpdir)
    return rimraf(tmpdir)
  }).catch(error => {
    log.disableProgress()
    log.error('unpack', error.stack)
    log.verbose('not removing', tmpdir)
  })
}

function report (albums, root, archives, archiveRoot) {
  const sorted = [...albums].sort((first, second) => {
    let result = first.getDate().localeCompare(second.getDate())
    if (result !== 0) return result

    return first.toPath().toLowerCase().localeCompare(second.toPath().toLowerCase())
  })

  console.log('new albums from this run:\n')
  for (let album of sorted) console.log(join(root, album.toPath()))

  console.log('\nfull details:\n')
  for (let album of sorted) console.log(album.dump())
}

function reportArchived (albums) {
  const archived = [...albums].filter(a => a.destArchive)
  if (archived.length === 0) return

  console.log('now archived:\n')
  for (let album of archived) {
    console.log(album.sourceArchive, '\n  ->', album.destArchive)
  }
}
