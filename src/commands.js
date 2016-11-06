import log from 'npmlog'
import untildify from 'untildify'

import options from './config/options.js'

import albums from './command/albums.js'
import artists from './command/artists.js'
import audit from './command/audit.js'
import inspect from './command/inspect.js'
import optimize from './command/optimize.js'
import pack from './command/pack.js'
import pls from './command/pls.js'
import unpack from './command/unpack.js'

const commands = {
  active: null,
  albums: {
    command: 'albums [files...]',
    description: 'generate a list of albums from roots',
    builder: yargs => yargs.usage('Usage: $0 [options] albums [-R dir [file...]]')
                           .options({
                             R: options.R
                           })
                           .check(argv => {
                             if (argv._.length > 1 || (argv.R && argv.R.length)) return true

                             return 'Must pass 1 or more audio files or directory trees.'
                           }),
    handler: argv => {
      const files = argv.files.map(untildify)
      const roots = (argv.R || []).map(untildify)
      log.silly('albums', 'files', files)
      log.silly('albums', 'roots', roots)

      commands.active = albums(files, roots)
    }
  },
  artists: {
    command: 'artists [files...]',
    description: 'generate a list of artists from roots',
    builder: yargs => yargs.usage('Usage: $0 artists [-R dir [file...]]')
                           .options({
                             R: options.R
                           })
                           .check(argv => {
                             if (argv._.length > 1 || (argv.R && argv.R.length)) return true

                             return 'Must pass 1 or more audio files or directory trees.'
                           }),
    handler: argv => {
      const files = argv.files.map(untildify)
      const roots = (argv.R || []).map(untildify)
      log.silly('artists', 'files', files)
      log.silly('artists', 'roots', roots)

      commands.active = artists(files, roots)
    }
  },
  audit: {
    command: 'audit [files...]',
    description: 'check metadata for inconsistencies',
    builder: yargs => yargs.usage('Usage: $0 audit [file [file...]]')
                           .check((argv) => {
                             if (argv._.length > 1) return true

                             return 'must pass either 1 or more files containing metadata'
                           }),
    handler: argv => {
      const files = argv.files.map(untildify)
      log.silly('audit', 'files', files)

      commands.active = audit(files)
    }
  },
  inspect: {
    command: 'inspect [files...]',
    description: 'dump all the metadata from a track or album',
    builder: yargs => yargs.usage('Usage: $0 [options] inspect [file [dir...]]')
                           .demand(1),
    handler: argv => {
      const files = argv.files.map(untildify)
      log.silly('inspect', 'files', files)

      commands.active = inspect(files)
    }
  },
  optimize: {
    command: 'optimize [files...]',
    description: 'find the best set of albums to pack a given capacity',
    builder: yargs => yargs.usage('Usage: $0 [options] optimize -O blocks [-R dir [file...]]')
                           .options({
                             B: options.B,
                             O: options.O,
                             R: options.R
                           })
                           .check((argv) => {
                             if (argv._.length > 1 || (argv.R && argv.R.length)) return true

                             return 'Must pass 1 or more audio files or directory trees.'
                           }),
    handler: argv => {
      const files = argv.files.map(untildify)
      const roots = (argv.R || []).map(untildify)
      log.silly('optimize', 'files', files)
      log.silly('optimize', 'roots', roots)

      commands.active = optimize(files, roots, argv.B, argv.O)
    }
  },
  pack: {
    command: 'pack',
    description: 'fill a volume with releases, optimally',
    builder: yargs => yargs.usage('Usage: $0 [options] pack --to dest --from src [-R dir [file...]]')
                           .options({
                             B: options.B,
                             R: options.from,
                             s: options.to,
                             T: options.T,
                             'mp3-encoder': options.mp3Encoder,
                             'encoding-profile': options.encodingProfile
                           }),
    handler: argv => {
      const roots = (argv.R || []).map(untildify)
      log.silly('pack', 'roots', roots)

      commands.active = pack(roots, argv.s, argv.B)
    }
  },
  pls: {
    command: 'pls',
    description: 'print a list of albums as a .pls file, sorted by date',
    builder: yargs => yargs.usage('Usage: $0 [options] pls [-R dir [-R dir...]]')
                           .options({
                             R: options.R
                           })
                           .required('R', '- Must have at least one tree to scan.'),
    handler: argv => {
      const roots = argv.R.map((r) => untildify(r))
      log.silly('pls', 'roots', roots)

      commands.active = pls(roots)
    }
  },
  unpack: {
    command: 'unpack [files...]',
    description: 'unpack a set of zipped files into a staging directory',
    builder: yargs => yargs.usage('Usage: $0 [options] unpack [zipfile [zipfile...]]')
                           .options({
                             R: options.RZ,
                             P: options.P,
                             s: options.s,
                             archive: options.archive,
                             'archive-root': options.archiveRoot,
                             playlist: options.playlist
                           })
                           .check((argv) => {
                             if (argv._.length > 1 || (argv.R && argv.R.length && argv.P)) return true

                             return 'Must pass either 1 or more zipfiles, or root and glob pattern.'
                           }),
    handler: argv => {
      const files = argv.files.map(untildify)
      const roots = (argv.R || []).map(untildify)
      log.silly('unpack', 'files', files)
      log.silly('unpack', 'roots', roots)

      commands.active = unpack(
        { files, roots, pattern: argv.P },
        argv.s,
        argv.archive && argv.archiveRoot && untildify(argv.archiveRoot),
        argv.playlist && untildify(argv.playlist)
      )
    }
  }
}

// Babel object export doesn't do hoisting, so leave this here
export default commands
