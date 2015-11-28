#!/usr/bin/env node

import fs from 'graceful-fs'
import { basename } from 'path'

import log from 'npmlog'
import rc from 'rc'
import untildify from 'untildify'
import { promisify } from 'bluebird'
import { stringify as inify } from 'ini'
import Bluebird from 'bluebird'

import audit from './metadata/audit.js'
import makePlaylist from './utils/make-playlist.js'
import optimize from './command/optimize.js'
import scanAlbums from './albums.js'
import scanArtists from './artists.js'
import scanFLAC from './flac/scan.js'
import showAlbums from './show-albums.js'
import unpack from './unpack.js'

const writeFile = promisify(fs.writeFile)

const configPath = untildify('~/.packardrc')
const config = rc(
  'packard',
  {
    loglevel: 'info',
    roots: undefined,
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
                .command('albums', 'print a list of albums in human-readable format')
                .command('artists', 'generate a list of artists from roots')
                .command('audit', 'check metadata for inconsistencies')
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
  O: {
    alias: 'optimal-capacity',
    describe: 'size of target volume, in blocks',
    required: '- Must have a target to optimize towards.'
  },
  P: {
    alias: 'pattern',
    describe: 'bash glob pattern used to match files under root'
  },
  R: {
    alias: 'root',
    array: true,
    describe: 'directory root for an Artist/Album tree'
  },
  S: {
    alias: 'block-size',
    describe: 'size of blocks on target volume',
    default: 512
  },
  s: {
    alias: 'staging',
    describe: 'where to create the tree for unpacked artists',
    required: '- Must have a place to put unpacked files.'
  },
  archive: {
    describe: 'after other operations, archive original files',
    boolean: true
  },
  archiveRoot: {
    describe: "where to archive zip files once they've been unpacked"
  },
  playlist: {
    describe: 'create a playlist containing all of the unpacked albums',
    string: true
  }
}

function sip (argument, value) {
  log.silly('setIfPresent', 'argument', argument, 'value', value)
  if (value) options[argument].default = value
}

sip('R', config.roots)
sip('P', config.archive['glob-pattern'])
sip('s', config['staging-directory'])
sip('archive', Boolean(config.archive['enabled-by-default']))
sip('archiveRoot', config.archive.root)

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
  case 'albums':
    argv = yargs.reset()
                .usage('Usage: $0 [options] albums [-R dir [file...]]')
                .options({
                  R: options.R
                })
                .check(argv => {
                  if (argv._.length > 1 || (argv.R && argv.R.length)) return true

                  return 'Must pass 1 or more audio files or directory trees.'
                })
                .argv

    log.silly('albums argv', argv)
    showAlbums(argv._.slice(1), argv.R, groups)
    break
  case 'artists':
    options.R.required = '- Must have at least one tree to scan.'
    argv = yargs.reset()
                .usage('Usage: $0 artists [-R dir [-R dir...]]')
                .options({ R: options.R })
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
  case 'audit':
    argv = yargs.reset()
                .usage('Usage: $0 audit [file [file...]]')
                .check(argv => {
                  if (argv._.length > 1) return true

                  return 'must pass either 1 or more files containing metadata'
                })
                .argv

    const files = argv._.slice(1)
    log.silly('audit', 'argv', argv)
    log.silly('audit', 'files', files)

    log.enableProgress()
    scanAlbums(files, groups)
      .then(albums => {
        log.disableProgress()
        log.silly('audit', 'albums', albums)
        for (let album of albums) {
          const id = album.artist.name + ': ' + album.name + ' /'
          for (let warning of audit(album)) log.warn('audit', id, warning)
        }
        log.silly('audit', 'tracker debugging', log.tracker.debug())
      })
      .catch(e => {
        log.disableProgress()
        log.error('audit', e.stack)
      })

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
    Bluebird.map(things, f => {
      groups.set(basename(f), log.newGroup(f))
      return scanFLAC(f, groups)
    })
    .then(track => {
      log.disableProgress()
      console.log(JSON.stringify(track, null, 2))
      log.silly('inspect', 'tracker debugging', log.tracker.debug())
    })
    .catch(e => {
      log.disableProgress()
      log.error('inspect', e.stack)
    })

    break
  case 'optimize':
    argv = yargs.reset()
                .usage('Usage: $0 [options] optimize -O blocks [-R dir [file...]]')
                .options({
                  O: options.O,
                  R: options.R,
                  S: options.S
                })
                .check(argv => {
                  if (argv._.length > 1 || (argv.R && argv.R.length)) return true

                  return 'Must pass 1 or more audio files or directory trees.'
                })
                .argv

    log.silly('optimize argv', argv)
    optimize(argv._.slice(1), argv.R, argv.S, argv.O, groups)
    break
  case 'pls':
    options.R.required = '- Must have at least one tree to scan.'
    argv = yargs.reset()
                .usage('Usage: $0 [options] pls [-R dir [-R dir...]]')
                .options({
                  R: options.R
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
                  if (argv._.length > 1 || (argv.R && argv.R.length && argv.P)) return true

                  return 'Must pass either 1 or more zipfiles, or root and glob pattern.'
                })
                .argv

    log.silly('unpack argv', argv)
    const zipfiles = argv._.slice(1)

    let finish = unpack(
      zipfiles,
      argv.s,
      (argv.R || [])[0], argv.P,
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
