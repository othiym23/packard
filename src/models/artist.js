export default class Artist {
  constructor (name, albums = []) {
    this.name = name
    this.albums = albums
    this.otherTracks = []
  }

  addOtherTracks (tracks) {
    this.otherTracks = this.otherTracks.concat(tracks)
  }

  getSize (bs = 1) {
    return this.albums.reduce((t, a) => t + a.getSize(bs), 0) +
           this.otherTracks.reduce((total, track) => total + track.getSize(bs), 0)
  }
}
