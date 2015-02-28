const Album = require('./album-base.js')

class MultitrackAlbum extends Album {
  constructor (name, artist, path, tracks = []) {
    super(name, artist, path)

    this.tracks = tracks
  }

  getSize (bs = 1) {
    return this.tracks.reduce((t, track) => t + track.getSize(bs), 0) +
           this.pictures.reduce((c, cover) => c + cover.getSize(bs), 0)
  }
}

module.exports = MultitrackAlbum
