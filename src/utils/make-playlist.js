import { stringify as inify } from 'ini'
import log from 'npmlog'

export default function makePlaylist (albums) {
  let index = 0
  const playlist = {}
  for (let album of albums) {
    log.verbose('makePlaylist', 'album', album.name, 'has date', album.date)
    for (let track of album.tracks) {
      index++
      playlist['File' + index] = track.file.path
      playlist['Title' + index] = track.name
      playlist['Length' + index] = Math.ceil(track.duration)
    }
  }
  playlist['NumberOfEntries'] = index
  playlist['Version'] = 2
  log.info('makePlaylist', 'created playlist with', index, 'tracks')
  return inify(playlist, {section: 'playlist'})
}
