const {join, basename} = require('path')

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

  toPath () {
    const dates = this.tracks.reduce((s, t) => s.add(t.date), new Set())
    let name = ''
    if (dates.size > 0) name += '[' + Array.from(dates.values()) + '] '
    name += this.name
    return join(
      safe(this.artist),
      safe(name)
    )
  }

  dump () {
    let dumped = this.toPath() + '/\n'
    for (let track of this.tracks.sort((a, b) => (a.index || 0) - (b.index || 0))) {
      dumped += '   ' + track.safeName() + '\n'
    }

    for (let cover of this.pictures) {
      dumped += 'c: ' + join(this.toPath(), basename(cover.path)) + '\n'
    }
    dumped += '(unpacked to ' + this.path + ')\n'

    return dumped
  }
}

function safe (string) {
  return string.replace(/[^ \]\[A-Za-z0-9-]/g, '')
}

module.exports = MultitrackAlbum
