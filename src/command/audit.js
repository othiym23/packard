import log from 'npmlog'

import auditAlbum from '../metadata/audit.js'
import scanAlbums from '../albums.js'

export default function audit (roots, groups) {
  log.silly('audit', 'files', roots)

  log.enableProgress()
  return scanAlbums(roots, groups)
    .then(albums => {
      log.disableProgress()
      log.silly('audit', 'albums', albums)
      for (let album of albums) {
        const id = album.artist.name + ': ' + album.name + ' /'
        for (let warning of auditAlbum(album)) log.warn('audit', id, warning)
      }
    })
}
