import fs from 'graceful-fs'

import log from 'npmlog'
import { stringify as inify } from 'ini'
import untildify from 'untildify'

import { promisify } from 'bluebird'
const writeFile = promisify(fs.writeFile)

const configPath = untildify('~/.packardrc')
export default function saveConfig (argv) {
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
