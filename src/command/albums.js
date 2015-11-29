import log from 'npmlog'

import scanAlbums from '../albums.js'

export default function showAlbums (files = [], roots = []) {
  const entities = files.concat(roots)
  log.enableProgress()
  log.silly('showAlbums', 'scanning', entities)
  return scanAlbums(entities)
    .then(albums => {
      log.disableProgress()
      report(albums)
    })
}

function report (albums) {
  const sorted = albums.sort((a, b) => b.getSize() - a.getSize())
  let total = 0
  for (let album of sorted) {
    total += album.getSize(512)
    console.log('%s [%sM]', album.path, album.getSize(1024 * 1024))
  }
  console.log('TOTAL: %s 512-byte blocks', total)
}
