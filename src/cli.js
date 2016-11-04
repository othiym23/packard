#!/usr/bin/env node

import 'babel-polyfill'

import log from 'npmlog'

// don't log the config until the log level is set
import config from './config/default.js'
import options from './config/options.js'
import saveConfig from './config/save.js'

import commands from './commands.js'

const yargs = require('yargs')
                .usage('Usage: $0 [options] <command>')
                .command(commands.albums)
                .command(commands.artists)
                .command(commands.audit)
                .command(commands.inspect)
                .command(commands.optimize)
                .command(commands.pack)
                .command(commands.pls)
                .command(commands.unpack)
                .options({
                  S: options.S,
                  loglevel: options.loglevel
                })
                .help('h')
                .alias('h', 'help')
                .version(() => require('../package').version)
                .global('loglevel')
                .global('S')
                .env('PACKARD')
                .demand(1)
                .strict()

const argv = yargs.argv
log.level = argv.loglevel
log.silly('packard', 'argv', argv)

log.verbose('config', config)

let command = commands.active
if (argv.saveConfig) command = command.then(() => saveConfig(argv))
command.then(() => {
  log.silly('packard', 'tracker debugging', log.tracker.debug())
}).catch((e) => {
  log.disableProgress()
  log.error('packard', e.stack)
})
