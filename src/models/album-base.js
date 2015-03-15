var assert = require('assert')

class Album {
  constructor (name, artist, path) {
    assert(name, 'must include an album name')
    assert(artist, 'must include an artist name')

    this.name = name
    this.artist = artist
    this.path = path || ''
    this.pictures = []
    // might be coming from cue sheet
    this.tracks = []
  }
}

module.exports = Album
