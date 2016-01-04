#!/usr/bin/env node

import 'babel-polyfill'

import log from 'npmlog'
import untildify from 'untildify'

// don't log the config until the log level is set
import config from './config/default.js'
import options from './config/options.js'
import saveConfig from './config/save.js'

import albums from './command/albums.js'
import artists from './command/artists.js'
import audit from './command/audit.js'
import inspect from './command/inspect.js'
import optimize from './command/optimize.js'
import pls from './command/pls.js'
import unpack from './command/unpack.js'

const yargs = require('yargs')
                .usage('Usage: $0 [options] <command>')
                .command('albums', 'generate a list of albums from roots')
                .command('artists', 'generate a list of artists from roots')
                .command('audit', 'check metadata for inconsistencies')
                .command('inspect', 'dump all the metadata from a track or album')
                .command('optimize', 'find the best set of albums to pack a given capacity')
                .command('pls', 'print a list of albums as a .pls file, sorted by date')
                .command('unpack', 'unpack a set of zipped files into a staging directory')
                .options({
                  S: options.S,
                  loglevel: options.loglevel
                })
                .help('h')
                .alias('h', 'help')
                .version(() => require('../package').version)
                .demand(1)

log.level = yargs.argv.loglevel
log.verbose('config', config)

let argv, command, roots, files
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
    files = argv._.slice(1).map(untildify)
    roots = (argv.R || []).map(untildify)
    log.silly('albums', 'argv', argv)

    command = albums(files, roots)
    break
  case 'artists':
    options.R.required = '- Must have at least one tree to scan.'
    argv = yargs.reset()
                .usage('Usage: $0 artists [-R dir [-R dir...]]')
                .options({
                  R: options.R
                })
                .argv
    roots = argv.R.map(untildify)
    log.silly('artists', 'argv', argv)

    command = artists(roots)
    break
  case 'audit':
    argv = yargs.reset()
                .usage('Usage: $0 audit [file [file...]]')
                .check(argv => {
                  if (argv._.length > 1) return true

                  return 'must pass either 1 or more files containing metadata'
                })
                .argv
    files = argv._.slice(1).map(untildify)
    log.silly('audit', 'argv', argv)

    command = audit(files)
    break
  case 'inspect':
    argv = yargs.reset()
                .usage('Usage: $0 [options] inspect [file [dir...]]')
                .demand(2)
                .argv

    files = argv._.slice(1).map(untildify)
    log.silly('audit', 'argv', argv)

    command = inspect(files)
    break
  case 'optimize':
    argv = yargs.reset()
                .usage('Usage: $0 [options] optimize -O blocks [-R dir [file...]]')
                .options({
                  B: options.B,
                  O: options.O,
                  R: options.R
                })
                .check(argv => {
                  if (argv._.length > 1 || (argv.R && argv.R.length)) return true

                  return 'Must pass 1 or more audio files or directory trees.'
                })
                .argv
    files = argv._.slice(1).map(untildify)
    roots = (argv.R || []).map(untildify)
    log.silly('optimize argv', argv)

    command = optimize(files, roots, argv.B, argv.O)
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

    command = pls(roots)
    break
  case 'unpack':
    options.R.describe = 'root directory containing zipped files'
    argv = yargs.reset()
                .usage('Usage: $0 [options] unpack [zipfile [zipfile...]]')
                .options({
                  R: options.R,
                  P: options.P,
                  s: options.s,
                  archive: options.archive,
                  'archive-root': options.archiveRoot,
                  playlist: options.playlist
                })
                .check(argv => {
                  if (argv._.length > 1 || (argv.R && argv.R.length && argv.P)) return true

                  return 'Must pass either 1 or more zipfiles, or root and glob pattern.'
                })
                .argv
    files = argv._.slice(1).map(untildify)
    roots = (argv.R || []).map(untildify)
    log.silly('unpack argv', argv)

    command = unpack(
      { files, roots, pattern: argv.P },
      argv.s,
      argv.archive && argv.archiveRoot && untildify(argv.archiveRoot),
      argv.playlist && untildify(argv.playlist)
    )
    break
  default:
    yargs.showHelp()
    process.exit(1)
}

if (argv.saveConfig) command = command.then(() => saveConfig(argv))
command.then(() => {
  log.silly('packard', 'tracker debugging', log.tracker.debug())
}).catch(e => {
  log.disableProgress()
  log.error('packard', e.stack)
})
