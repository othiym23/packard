const inify = require('ini').stringify
const log = require('npmlog')

function makePlaylist (albums) {
  let index = 0
  const playlist = {}
  for (let album of albums) {
    log.verbose('makePlaylist', 'album', album.name, 'has date', album.date)
    for (let track of album.tracks) {
      index++
      playlist['File' + index] = track.path
      playlist['Title' + index] = track.name
      playlist['Length' + index] = Math.ceil(track.duration)
    }
  }
  playlist['NumberOfEntries'] = index
  playlist['Version'] = 2
  log.info('makePlaylist', 'playlist generated with', index, 'entries')
  return inify(playlist, {section: 'playlist'})
}

module.exports = makePlaylist
