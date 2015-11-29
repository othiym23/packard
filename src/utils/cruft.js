import 'babel-polyfill'

const cruft = new Set([
  '.DS_Store',    // OS X metadata is very cluttery
  '.AppleDouble', // see above
  '.localized',   // OS X localization
  'Thumbs.db',    // yes, I do run Windows sometimes
  '__MACOSX',     // in OS X-created zipfiles
  '.Parent'       // I have no idea
])

export default cruft
