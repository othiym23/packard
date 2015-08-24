// oh iterables
import 'babel/polyfill'

import { join, basename } from 'path'

import log from 'npmlog'

import Album from './album-base.js'

export default class MultitrackAlbum extends Album {
  constructor (name, artist, path, tracks = []) {
    super(name, artist, path)

    this._tracks = tracks
    this.sourceArchive = null
    this.destArchive = null
  }

  get tracks () {
    return this._tracks.sort((a, b) => (a.index || 0) - (b.index || 0))
  }

  set tracks (tracks) {
    this._tracks = tracks
  }

  getSize (bs = 1) {
    return this.tracks.reduce((t, track) => t + track.getSize(bs), 0) +
           this.pictures.reduce((c, cover) => c + cover.getSize(bs), 0)
  }

  toPath () {
    const dates = this.tracks.reduce((s, t) => {
      if (t.date) s.add(t.date); return s
    }, new Set())

    let name = ''
    if (dates.size > 0) name += '[' + [...dates][0] + '] '
    name += this.name
    return join(
      safe(this.artist.name),
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
    if (this.path) dumped += '(unpacked to ' + this.path + ')\n'

    return dumped
  }

  getDate () {
    const dates = this.tracks.reduce((s, t) => s.add(t.date), new Set())
    if (dates.size > 1) {
      log.warn('album', 'tracks have inconsistent dates', [...dates])
    }

    return [...dates][0] || ''
  }
}

function safe (string) {
  return (string || '').replace(/[^ \]\[A-Za-z0-9-]/g, '')
}
