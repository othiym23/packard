import log from 'npmlog'

import config from './default.js'

const options = {
  B: {
    alias: 'block-size',
    describe: 'size of blocks on target volume',
    default: 512
  },
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
    alias: 'save-config',
    describe: "save this run's configuration to ~/.packardrc",
    boolean: true,
    default: false
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
  from: {
    alias: 'from',
    array: true,
    describe: 'where to move tracks and albums from'
  },
  loglevel: {
    describe: 'logging level',
    default: config.loglevel
  },
  playlist: {
    describe: 'create a playlist containing all of the unpacked albums',
    string: true
  },
  to: {
    alias: 'to',
    describe: 'root relative to which to start packing',
    required: '- Must have a root to move files to.'
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

// Babel object export doesn't do hoisting, so leave this here
export default options
