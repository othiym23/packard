import log from 'npmlog'

import scanAlbums from '../albums.js'
import makePlaylist from '../utils/make-playlist.js'

export default function pls (roots) {
  log.enableProgress()
  return scanAlbums(roots)
    .then(albums => {
      log.disableProgress()
      console.log(makePlaylist(albums))
    })
}
