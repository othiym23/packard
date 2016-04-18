import 'babel-polyfill'

import { basename, dirname } from 'path'

const files = new Set([
  '.DS_Store', // OS X metadata is very cluttery
  'Thumbs.db'  // yes, I do run Windows sometimes
])

const directories = new Set([
  '__MACOSX',     // in OS X-created zipfiles
  '.AppleDouble', // Samba or AFS, I think?
  '.localized'    // OS X localization
])

export default function isCruft (path) {
  const entry = basename(path || '')
  const contains = dirname(path || '')
  const parent = basename(contains)
  return (entry.indexOf('._') === 0 || files.has(entry) || directories.has(parent)) ? true
       : (contains === '.' || contains === path) ? false
       : isCruft(contains)
}
