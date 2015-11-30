export const typeToStreamData = new Map([
  ['duration', 'duration']
  // ['bitsPerSample', 'bitsPerSample'],
  // ['bytesToFirstFrame', 'bytesToFirstFrame'],
  // ['channels', 'channels'],
  // ['maxBlockSize', 'maxBlockSize'],
  // ['maxFrameSize', 'maxFrameSize'],
  // ['minBlockSize', 'minBlockSize'],
  // ['minFrameSize', 'minFrameSize'],
  // ['sampleRate', 'sampleRate'],
  // ['samplesInStream', 'samplesInStream'],
  // ['TRAKTOR4', 'traktor4']
])

export const typeToTag = new Map([
  ['TALB', 'album'],
  ['TPE1', 'artist'],
  ['COMM', 'comment'],
  ['TYER', 'date'],
  ['TDAT', 'monthYear'], // needs fixing up
  ['TCON', 'genre'],
  ['TIT2', 'title'],
  ['TSSE', 'encodedWith'],
  ['TPE2', 'albumArtist'],
  // ['ASIN', 'ASIN'],
  // ['BARCODE', 'upc'],
  ['ISRC', 'isrc'],
  ['APIC', 'picture'],
  ['TCMP', 'isCompilation'],
  // ['DISCNUMBER', 'disc'],
  // ['DISCTOTAL', 'discs'],
  ['TPOS', 'discs'], // must be fixed up, a la .m4a
  // ['pgap', 'hasPregap'],
  // ['purd', 'purchaseDate'],
  ['TSOA', 'sortAlbum'],
  ['TSO2', 'sortAlbumArtist'],
  ['TSOP', 'sortArtist'],
  ['TBPM', 'bpm'],
  // ['TRACKNUMBER', 'index'],
  // ['TOTALTRACKS', 'tracks'],
  ['TRCK', 'tracks'], // must be fixed up, a la .m4a
  // ['iTunes_CDDB_IDs', 'cddb'],
  // ['iTunNORM', 'iTunesNormalization'],
  // ['iTunSMPB', 'iTunesGaplessData']
  ['TCOM', 'composer'],
  ['TDRC', 'recordingDate'],
  ['TDOR', 'recordingTime'],
  ['TENC', 'encodedBy'],
  ['Album Subtitle', 'subtitle'],
  ['INITIALKEY', 'initialKey']
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
  ['UFID', 'trackID'], // must be fixed up
  ['MusicIP PUID', 'puid'],
  ['Acoustid Id', 'acoustID'],
  ['Artists', 'artists'],
  ['CATALOGNUMBER', 'catalogID'],
  ['DJMIXER', 'mixedBy'],
  ['TPUB', 'label'],
  ['LANGUAGE', 'language'],
  ['TMED', 'media'],
  ['TSST', 'mediumName'],
  ['SCRIPT', 'script'],
  ['TORY', 'originalYear'],
  ['ORIGINALDATE', 'originalDate'],
  ['originalyear', 'originalYear']
])
