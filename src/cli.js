#!/usr/bin/env node

const Promise = require('bluebird')
const promisify = Promise.promisify

const basename = require('path').basename
const writeFile = promisify(require('fs').writeFile)

const inify = require('ini').stringify
const log = require('npmlog')
const untildify = require('untildify')

const flac = require('./metadata/flac.js')
const makePlaylist = require('./utils/make-playlist.js')
const scanAlbums = require('./albums.js')
const scanArtists = require('./artists.js')
const unpack = require('./unpack.js')
const Track = require('./models/track.js')

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
    },
    playlist: undefined
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
                .command('artists', 'generate a list of artists from roots')
                .command('inspect', 'dump all the metadata from a track or album')
                .command(
                  'pls',
                  'print a list of albums as a .pls file, sorted by date'
                )
                .command(
                  'unpack',
                  'unpack a set of zipped files into a staging directory'
                )
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
  },
  playlist: {
    describe: 'create a playlist containing all of the unpacked albums',
    string: true
  }
}

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

let argv, roots
const groups = new Map()
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
    roots = argv.R.map(r => untildify(r))
    log.silly('artists', 'argv', argv)

    log.enableProgress()
    scanArtists(roots, groups).then(roots => {
      log.disableProgress()
      for (let [root, sorted] of roots) {
        if (sorted.length) {
          console.log('\nROOT %s:', root)
          for (let a of sorted) {
            console.log('%s [%sM]', a.name, a.getSize(1024 * 1024))
          }
        }
      }
    }).catch(error => log.error('artists', error.stack))
    break
  case 'inspect':
    argv = yargs.reset()
                .usage('Usage: $0 [options] inspect [file [dir...]]')
                .demand(2)
                .argv

    const things = argv._.slice(1)
    log.silly('inspect', 'argv', argv)
    log.silly('inspect', 'things', things)

    log.enableProgress()
    Promise.map(things, f => {
      groups.set(basename(f), log.newGroup(f))
      return flac.scan({path: f}, groups)
    })
    .map(b => {
      b.flacTrack = Track.fromFLAC(b.metadata, b.path, b.stats)
      return b
    })
    .each(b => {
      log.verbose('bundle', b)
      const tagnames = Object.keys(b.metadata).filter(n => n.match(/^[A-Z_]+$/)).sort()
      log.verbose('tag names', tagnames)
    })
    .then(bs => {
      log.disableProgress()
      console.log(JSON.stringify(bs, null, 2))
    })
    .catch(e => {
      log.disableProgress()
      log.error('inspect', e.stack)
    })
    .then(() => log.disableProgress())

    break
  case 'pls':
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
    roots = argv.R.map(r => untildify(r))
    log.silly('pls', 'argv', argv)

    log.enableProgress()
    scanAlbums(roots, groups).then(sorted => console.log(makePlaylist(sorted)))
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
                  'archive-root': options.archiveRoot,
                  playlist: options.playlist
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
    if (argv.playlist) {
      finish = finish.then(albums => {
        return writeFile(untildify(argv.playlist), makePlaylist(albums), 'utf-8')
      })
    }
    if (argv.saveConfig) finish = finish.then(() => saveConfig(argv))
    finish.catch(e => log.error('unpack', e.stack))
    break
  default:
    yargs.showHelp()
    process.exit(1)
}
