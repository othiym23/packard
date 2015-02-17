const {basename, dirname, extname} = require("path")
const {readdir, stat} = require("fs")
const resolve = require("path").resolve

const once = require("once")

const Artist = require("./models/artist.js")
const Cover = require("./models/cover.js")
const Multitrack = require("./models/album-multi.js")
const Singletrack = require("./models/album-single.js")
const Track = require("./models/track.js")

const roots = [
  "/Users/ogd/Music/flac"
]

const cruft = [
  ".DS_Store", // OS X metadata is very cluttery
  "Thumbs.db"  // yes, I do run Windows sometimes
]

const cues = new Map()

function readRoot (root, cb_) {
  let cb = once(cb_)

  readdir(root, function (error, entries) {
    if (error) return cb(error)

    const artists = []

    let i = entries.length
    entries.forEach(function (entry) {
      if (cruft.indexOf(entry) !== -1) {
        --i
        return next()
      }

      stat(resolve(root, entry), function (error, stats) {
        if (error) return cb(error)

        if (stats.isDirectory()) {
          readArtist(root, entry, function (error, artist) {
            if (error) return cb(error)

            --i
            artists.push(artist)

            next()
          })
        }
        else {
          --i
          next()
        }
      })
    })

    function next () {
      if (i === 0) cb(null, artists, artists.reduce((t, a) => t.concat(a.albums), []))
    }
  })
}

function readArtist (root, directory, cb_) {
  const cb = once(cb_)
  const artistPath = resolve(root, directory)
  readdir(artistPath, function (error, entries) {
    if (error) return cb(error)

    const albums = []

    let i = entries.length
    entries.forEach(function (entry) {
      if (cruft.indexOf(entry) !== -1) {
        --i
        return next()
      }

      const currentPath = resolve(artistPath, entry)
      stat(currentPath, function (error, stats) {
        if (error) return cb(error)

        if (stats.isDirectory()) {
          readAlbum(root, directory, entry, function (error, album) {
            if (error) return cb(error)

            --i
            albums.push(album)
            next()
          })
        }
        else if (stats.isFile()) {
          --i
          const ext = extname(entry)
          const base = resolve(artistPath, basename(entry, ext))
          switch (ext) {
            case ".flac":
            case ".mp3":
              albums.push(new Singletrack(
                entry,
                directory,
                currentPath,
                stats
              ))
              break
            case ".cue":
              cues.set(base, currentPath)
              break
            case ".log":
              // nothing to do with these
              break
            default:
              console.log("not sure what to do", entry)
          }
          next()
        }
        else {
          i--
          console.log("rando in artist directory:", directory, entry)
        }
      })
    })

    function next () {
      if (i > 0) return

      albums.forEach((a) => {
        const p = a.path
        const ext = extname(p)
        const base = resolve(dirname(p), basename(p, ext))
        if (cues.get(base)) a.cuesheet = cues.get(base)
      })
      cb(null, new Artist(directory, albums))
    }
  })
}

function readAlbum (root, artist, album, cb_) {
  const cb = once(cb_)

  const albumPath = resolve(root, artist, album)
  readdir(albumPath, function (error, entries) {
    if (error) return cb(error)

    const tracks = []
    const covers = []

    let i = entries.length
    entries.forEach(function (entry) {
      if (cruft.indexOf(entry) !== -1) {
        i--
        return next()
      }

      stat(resolve(albumPath, entry), function (error, stats) {
        if (stats.isDirectory()) {
          i--
          console.log("witaf. what is a directory doing here?", entry)
          next()
        }
        else if (stats.isFile()) {
          i--
          switch (extname(entry)) {
            case ".flac":
            case ".mp3":
              tracks.push(new Track(
                artist,
                album,
                entry,
                stats
              ))
              break
            case ".jpg":
            case ".pdf":
            case ".png":
              covers.push(new Cover(
                resolve(albumPath, entry),
                stats
              ))
              break
            default:
              console.log("I dunno, boss", entry)
          }
          next()
        }
        else {
          i--
          console.log("what", entry)
          next()
        }
      })
    })

    function next () {
      if (i > 0) return

      const a = new Multitrack(album, artist, albumPath, tracks)
      if (covers.length) a.pictures = covers

      cb(null, a)
    }
  })
}

readRoot(roots[0], function (error, artists, albums) {
  if (error) throw error

  albums.forEach((a) => console.log("%s - %s [%s]", a.artist, a.name, a.getSize(1024 * 1024)))
  artists.forEach((a) => console.log("%s [%s]", a.name, a.getSize(1024 * 1024)))
})
