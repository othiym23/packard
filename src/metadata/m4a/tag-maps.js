export const typeToStreamData = new Map([
  ['duration', 'duration'],
  // ['bitsPerSample', 'bitsPerSample'],
  // ['bytesToFirstFrame', 'bytesToFirstFrame'],
  // ['channels', 'channels'],
  // ['maxBlockSize', 'maxBlockSize'],
  // ['maxFrameSize', 'maxFrameSize'],
  // ['minBlockSize', 'minBlockSize'],
  // ['minFrameSize', 'minFrameSize'],
  // ['sampleRate', 'sampleRate'],
  // ['samplesInStream', 'samplesInStream'],
  ['TRAKTOR4', 'traktor4']
])

export const typeToTag = new Map([
  ['©alb', 'album'],
  ['©ART', 'artist'],
  ['©cmt', 'comment'],
  ['©day', 'date'],
  ['©gen', 'genre'],
  ['©nam', 'title'],
  ['©src', 'isrc'],
  ['©too', 'encodedWith'],
  ['aART', 'albumArtist'],
  ['ASIN', 'ASIN'],
  ['BARCODE', 'upc'],
  ['covr', 'picture'],
  ['cpil', 'isCompilation'],
  ['disk', 'discs'], // split into disc/discs
  ['pgap', 'hasPregap'],
  ['purd', 'purchaseDate'],
  ['soaa', 'sortAlbumArtist'],
  ['soar', 'sortArtist'],
  ['tmpo', 'bpm'],
  ['trkn', 'tracks'], // split into index/tracks
  ['iTunes_CDDB_IDs', 'cddb'],
  ['iTunNORM', 'iTunesNormalization'],
  ['iTunSMPB', 'iTunesGaplessData']
  // ['INITIALKEY', 'initialKey']
  // ['TCOM', 'composer'],
  // ['TDRC', 'recordingDate'],
  // ['TDOR', 'recordingTime'],
  // ['TENC', 'encodedBy'],
  // ['TSOA', 'sortAlbum'],
  // ['Album Subtitle', 'subtitle'],
])

export const typeToMB = new Map([
  ['MusicBrainz Album Artist Id', 'albumArtistID'],
  ['MusicBrainz Album Id', 'albumID'],
  ['MusicBrainz Album Release Country', 'releaseCountry'],
  ['MusicBrainz Album Status', 'status'],
  ['MusicBrainz Album Type', 'type'],
  ['MusicBrainz Artist Id', 'artistID'],
  ['MusicBrainz Disc Id', 'discID'],
  ['MusicBrainz Release Group Id', 'releaseGroupID'],
  ['MusicBrainz Release Track Id', 'releaseTrackID'],
  ['MusicBrainz Track Id', 'trackID'],
  ['MusicIP PUID', 'puid'],
  ['Acoustid Id', 'acoustID'],
  ['ARTISTS', 'artists'],
  ['CATALOGNUMBER', 'catalogID'],
  ['DJMIXER', 'mixedBy'],
  ['LABEL', 'label'],
  ['LANGUAGE', 'language'],
  ['MEDIA', 'media'],
  ['SCRIPT', 'script'],
  ['ORIGINALYEAR', 'originalYear'],
  ['ORIGINALDATE', 'originalDate']
])
