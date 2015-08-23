var assert = require('assert')

export default class Album {
  constructor (name, artist, optional = {}) {
    assert(name, 'must include an album name')
    assert(artist, 'must include an artist name')

    this.name = name
    this.artist = artist
    this.path = optional.path || ''
    this.pictures = optional.pictures || []
    // might be coming from cue sheet
    this.tracks = optional.tracks || []
  }

  getSize () {
    return 0
  }
}
