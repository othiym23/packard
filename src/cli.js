#!/usr/bin/env node
const scanArtists = require('./artists.js')
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
                .command('artists', 'generate a list of artists from roots')
                .version(() => require('../package').version)
                .demand(1)

let options = {
  R: {
    alias: 'root',
    array: true,
    describe: 'directory root for an Artist/Album tree',
    required: 'must have at least one tree to scan',
    default: config.roots
  }
}

switch (yargs.argv._[0]) {
  case 'artists':
    let argv = yargs.reset()
         .options(options)
         .argv
    scanArtists(argv.R.map(r => untildify(r))).then(sorted => {
      for (let a of sorted) {
        console.log('%s [%s]', a.name, a.getSize(1024 * 1024))
      }
    }).catch(error => console.error('HURF DURF', error.stack))
    break
  default:
    yargs.showHelp()
    process.exit(1)
}
