export const typeToStreamData = new Map([
  ['duration', 'duration'],
  ['bitsPerSample', 'bitsPerSample'],
  ['bytesToFirstFrame', 'bytesToFirstFrame'],
  ['channels', 'channels'],
  ['maxBlockSize', 'maxBlockSize'],
  ['maxFrameSize', 'maxFrameSize'],
  ['minBlockSize', 'minBlockSize'],
  ['minFrameSize', 'minFrameSize'],
  ['sampleRate', 'sampleRate'],
  ['samplesInStream', 'samplesInStream'],
  ['TRAKTOR4', 'traktor4']
])

export const typeToTag = new Map([
  // ['Album Subtitle', 'subtitle'],
  // ['TDOR', 'recordingTime'],
  // ['TDRC', 'recordingDate'],
  // ['iTunNORM', 'iTunesNormalization'],
  // ['iTunSMPB', 'iTunesGaplessData']
  // ['pgap', 'hasPregap'],
  // ['purd', 'purchaseDate'],
  ['ALBUM ARTIST', 'albumArtist'],
  ['ALBUM', 'album'],
  ['ALBUMARTIST', 'albumArtist'],
  ['ALBUMARTISTSORT', 'sortAlbumArtist'],
  ['ARTIST', 'artist'],
  ['ARTISTSORT', 'sortArtist'],
  ['ASIN', 'ASIN'],
  ['BARCODE', 'upc'],
  ['BPM', 'bpm'],
  ['CODING_HISTORY', 'encoderHistory'],
  ['COMMENT', 'comment'],
  ['COMPILATION', 'isCompilation'],
  ['COMPOSER', 'composer'],
  ['CONTACT', 'contactURL'],
  ['CONTENTGROUP', 'grouping'],
  ['COPYRIGHT', 'copyright'],
  ['DATE', 'date'],
  ['DESCRIPTION', 'description'],
  ['DISCCOUNT', 'discs'],
  ['DISCNUMBER', 'disc'],
  ['DISCSUBTITLE', 'discSubtitle'],
  ['DISCTOTAL', 'discs'],
  ['ENCODED_BY', 'encodedBy'],
  ['ENCODER', 'encodedWith'],
  ['GENRE', 'genre'],
  ['INITIALKEY', 'initialKey'],
  ['ISRC', 'isrc'],
  ['ITUNES_CDDB_1', 'cddb'],
  ['MIXER', 'mixer'],
  ['ORIGINATOR_REFERENCE', 'protoolsID'],
  ['PRODUCER', 'producer'],
  ['PUBLISHER', 'publisher'],
  ['REMIXER', 'remixer'],
  ['TIME_REFERENCE', 'timecode'],
  ['TITLE', 'title'],
  ['TOTALDISCS', 'discs'],
  ['TOTALTRACKS', 'tracks'],
  ['TRACKNUMBER', 'index'],
  ['TRACKTOTAL', 'tracks'],
  ['UNSYNCEDLYRICS', 'lyrics'],
  ['UPC', 'upc'],
  ['VERSION', 'remix'],
  ['iTunes_CDDB_1', 'cddb'],
  ['picture', 'picture']
])

export const typeToMB = new Map([
  ['ACOUSTID_ID', 'acoustID'],
  ['ARTISTS', 'artists'],
  ['CATALOGNUMBER', 'catalogID'],
  ['DJMIXER', 'mixedBy'],
  ['LABEL', 'label'],
  ['LANGUAGE', 'language'],
  ['MEDIA', 'media'],
  ['MUSICBRAINZ_ALBUMARTISTID', 'albumArtistID'],
  ['MUSICBRAINZ_ALBUMID', 'albumID'],
  ['MUSICBRAINZ_ARTISTID', 'artistID'],
  ['MUSICBRAINZ_DISCID', 'discID'],
  ['MUSICBRAINZ_RELEASEGROUPID', 'releaseGroupID'],
  ['MUSICBRAINZ_RELEASESTATUS', 'status'],
  ['MUSICBRAINZ_RELEASETRACKID', 'releaseTrackID'],
  ['MUSICBRAINZ_RELEASETYPE', 'type'],
  ['MUSICBRAINZ_TRACKID', 'trackID'],
  ['MUSICIP_PUID', 'puid'],
  ['ORGANIZATION', 'organization'],
  ['ORIGINALDATE', 'originalDate'],
  ['ORIGINALYEAR', 'originalYear'],
  ['RELEASECOUNTRY', 'releaseCountry'],
  ['RELEASESTATUS', 'status'],
  ['RELEASETYPE', 'type'],
  ['SCRIPT', 'script']
])
