class Artist {
  constructor (name, albums = []) {
    this.name = name
    this.albums = albums
  }

  getSize (bs = 1) {
    return this.albums.reduce((t, a) => t + a.getSize(bs), 0)
  }
}

// must export class last because of how classes are transpiled
module.exports = Artist
