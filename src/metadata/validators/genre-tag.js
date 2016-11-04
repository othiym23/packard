import 'babel-polyfill'

import validate from 'aproba'

const genres = new Set([
  'Acid House',
  'Ambient',
  'Avant-Garde',
  'Black Metal',
  'Blues',
  'Death Metal',
  'Doom Metal',
  'Disco',
  'Drum\'n\'Bass',
  'Dub',
  'Dubstep',
  'Electro',
  'Electronic',
  'Emo',
  'Experimental',
  'Field Recordings',
  'Folk',
  'Gamelan',
  'Gothic',
  'Grime',
  'Hardcore',
  'Hip-Hop',
  'House',
  'IDM',
  'Indie',
  'Industrial',
  'Jazz',
  'Jungle',
  'Juke',
  'Metal',
  'Metalcore',
  'Noise',
  'Pop',
  'Post Rock',
  'Post Punk',
  'Progressive Rock',
  'Progressive Metal',
  'Psychedelia',
  'Punk',
  'Reggae',
  'Rock\'n\'Roll',
  'Slowcore',
  'Shoegazer',
  'Soundtrack',
  'Spoken Word',
  'Stoner Metal',
  'Techno',
  'Trap',
  'UK Garage',
  'UK Hardcore',
  'Vaporwave',
  'Witch House'
])

export default function validateGenreTag (track, warnings) {
  validate('OA', arguments)
  if (track.tags && track.tags.genre) {
    const genre = track.tags.genre
    if (!genres.has(genre)) {
      warnings.push('has unknown genre ' + genre)
    }

    if (genre.match(/^[ A-Z/-]+$/) && !genres.has(genre)) {
      warnings.push('has all-caps genre ' + genre)
    }
  } else {
    warnings.push('has no genre set')
  }
}
