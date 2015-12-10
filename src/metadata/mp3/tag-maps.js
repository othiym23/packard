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
  // ['TRAKTOR4', 'traktor4']
  ['TLEN', 'durationInMillis'],
  ['TraktorID', 'traktorID'],
  ['TFLT', 'filetype']
])

export const typeToTag = new Map([
  ['TALB', 'album'],
  ['TPE1', 'artist'],
  ['COMM', 'comment'],
  ['TYER', 'date'],
  ['TDAT', 'monthYear'], // needs fixing up
  ['TCON', 'genre'],
  ['STYLE', 'genre'],
  ['TIT2', 'title'],
  ['TSSE', 'encodedWith'],
  ['TPE2', 'albumArtist'],
  ['ALBUM ARTIST', 'albumArtist'],
  ['ASIN', 'ASIN'],
  ['BARCODE', 'upc'],
  ['ISRC', 'isrc'],
  ['TSRC', 'isrc'],
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
  ['TSOT', 'sortTitle'],
  ['TBPM', 'bpm'],
  ['fBPM', 'bpm'],
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
  ['ENCODER', 'encodedWith'],
  ['Album Subtitle', 'subtitle'],
  ['INITIALKEY', 'initialKey'],
  ['TKEY', 'initialKey'],
  ['TDTG', 'dateTagged'],
  ['Rip Date', 'dateRipped'],
  ['Rip date', 'dateRipped'],
  ['TCOP', 'copyright']
])

export const typeToMB = new Map([
  ['MusicBrainz Album Artist Id', 'albumArtistID'],
  ['MusicBrainz Album Id', 'albumID'],
  ['MusicBrainz Album Release Country', 'releaseCountry'],
  ['MusicBrainz Album Status', 'status'],
  ['MusicBrainz Album Type', 'type'],
  ['MusicBrainz Artist Id', 'artistID'],
  ['MusicBrainz Disc Id', 'discID'],
  ['DISCID', 'discID'],
  ['MusicBrainz Release Group Id', 'releaseGroupID'],
  ['MusicBrainz Release Track Id', 'releaseTrackID'],
  ['UFID', 'trackID'], // must be fixed up
  ['MusicIP PUID', 'puid'],
  ['Acoustid Id', 'acoustID'],
  ['Artists', 'artists'],
  ['CATALOGNUMBER', 'catalogID'],
  ['CATALOG', 'catalogID'],
  ['Catalog #', 'catalogID'],
  ['Catalog', 'catalogID'],
  ['DISCOGS_CATALOG', 'catalogID'],
  ['DJMIXER', 'mixedBy'],
  ['TPUB', 'label'],
  ['TLAN', 'language'],
  ['LANGUAGE', 'language'],
  ['Language', 'language'],
  ['TMED', 'media'],
  ['TSST', 'mediumName'],
  ['SCRIPT', 'script'],
  ['TORY', 'originalYear'],
  ['ORIGINALDATE', 'originalDate'],
  ['originalyear', 'originalYear']
])
