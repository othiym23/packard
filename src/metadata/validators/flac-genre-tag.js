import 'babel-polyfill'

import validate from 'aproba'

const genres = new Set([
  'Acid House',
  'Ambient',
  'Avant-Garde',
  'Black Metal',
  'Death Metal',
  'Doom Metal',
  'Disco',
  'Drum\'n\'Bass',
  'Dub',
  'Dubstep',
  'Electro',
  'Electronic',
  'Experimental',
  'Field Recordings',
  'Folk',
  'Gamelan',
  'Grime',
  'Hardcore',
  'Hip-Hop',
  'House',
  'IDM',
  'Indie',
  'Industrial',
  'Jungle',
  'Juke',
  'Metal',
  'Noise',
  'Pop',
  'Post Rock',
  'Post Punk',
  'Progressive Rock',
  'Psychedelia',
  'Punk',
  'Reggae',
  'Slowcore',
  'Shoegazer',
  'Soundtrack',
  'Space Rock',
  'Spoken Word',
  'Techno',
  'UK Garage',
  'UK Hardcore'
])

export default function validateFLACGenreTag (track, warnings) {
  validate('OA', arguments)
  if (track.flacTags && track.flacTags.GENRE) {
    const genre = track.flacTags.GENRE
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
