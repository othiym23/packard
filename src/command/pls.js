import log from 'npmlog'

import makePlaylist from '../utils/make-playlist.js'
import { scanAlbums } from './albums.js'

export default function pls (roots) {
  log.enableProgress()
  return scanAlbums(roots)
    .then(albums => {
      log.disableProgress()
      console.log(makePlaylist(albums))
    })
}
