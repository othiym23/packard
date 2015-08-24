import { join, resolve } from 'path'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'

import globCB from 'glob'
import log from 'npmlog'
import rimrafCB from 'rimraf'
import untildify from 'untildify'
import Promise from 'bluebird'
import { promisify } from 'bluebird'

import { place, moveToArchive } from './mover.js'
import { extractRelease } from './metadata/index.js'
import { albumsFromMetadata } from './metadata/flac.js'

const glob = promisify(globCB)
const rimraf = promisify(rimrafCB)

const covers = new Map()
const tmp = join(tmpdir(), 'packard-' + randomBytes(8).toString('hex'))

export default function unpack (files, staging, root, pattern, archive, archiveRoot) {
  log.enableProgress()
  let locate = Promise.resolve(files)
  if (root && pattern) {
    locate = locate.then(files => {
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
  }

  const groups = new Map()
  return locate.then(files => {
    if (files.length === 0) {
      log.info('unpack', 'no archives to process! CU L8R SAILOR')
      log.disableProgress()
      process.exit(0)
    }

    log.verbose('unpack', 'processing', files)
    files.forEach(f => groups.set(f, log.newGroup('process: ' + f)))
    return Promise.map(
      files,
      f => extractRelease(f, tmp, covers, groups),
      {concurrency: 2}
    )
  }).then(m => {
    return place(albumsFromMetadata(m, covers), staging, groups)
  }).then(placed => {
    if (!archive) return Promise.resolve(placed)
    return moveToArchive(placed, archiveRoot, groups).then(() => placed)
  }).then(albums => {
    log.disableProgress()
    report(albums, staging)
    if (archive) reportArchived(albums)
    log.silly('unpack', 'tracker debugging', log.tracker.debug())
    log.verbose('removing', tmp)
    return rimraf(tmp).then(() => albums)
  }).catch(error => {
    log.disableProgress()
    log.error('unpack', error.stack)
    log.verbose('not removing', tmp)
    throw error
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
