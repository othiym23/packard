import log from 'npmlog'

import scanAlbums from './albums.js'

export default function showAlbums (files = [], roots = [], trackerGroups) {
  const entities = files.concat(roots)
  log.enableProgress()
  log.silly('showAlbums', 'entities', entities)
  return scanAlbums(entities, trackerGroups)
    .then(albums => {
      log.disableProgress()
      report(albums)
    })
}

function report (albums) {
  console.log('albums:\n')
  for (let album of albums) console.log(album.dump())
}
