/*eslint-disable no-undef*/ // oh eslint
const Promise = require('bluebird')
/*eslint-enable no-undef*/

require('es6-shim')
const readRoot = require('./read-root.js')
// import readRoot from './read-root.js'

function isThing (thing) { return thing }

function reverseSize (a, b) {
  return b.getSize() - a.getSize()
}

function scanArtists (roots) {
  return Promise.all(roots.map(r => readRoot(r))).then(trees => {
    let artists = new Map()
    for (let tree of trees) {
      for (let a of tree.filter(isThing)) {
        const artist = artists.get(a.name)
        if (artist) {
          artist.albums = artist.albums.concat(a.albums)
        } else {
          artists.set(a.name, a)
        }
      }
    }

    return [...artists.values()].sort(reverseSize)
  })
}

// export default scanArtists
module.exports = scanArtists
