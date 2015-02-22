const scanArtist = require("./artists.js")
// import readRoot from "./read-root.js"

const roots = [
  "/Users/ogd/Music/flac",
  "/Users/ogd/Music/mp3"
]

function reverseSize (a, b) {
  return b.getSize() - a.getSize()
}

scanArtist(roots).then(sorted => {
  console.log("ARTISTS\n=======\n")
  for (let a of sorted) {
    console.log("%s [%s]", a.name, a.getSize(1024 * 1024))
  }

  console.log("\n\nALBUMS\n======\n")
  const albums = sorted.reduce((l, r) => l.concat(r.albums), [])
                       .sort(reverseSize)
  for (let a of albums) {
    console.log(
      "%s - %s [%s]%s",
      a.artist,
      a.name,
      a.getSize(1024 * 1024),
      a.cuesheet ? " [c]" : ""
    )
  }
}).catch(error => console.error("HURF DURF", error.stack))
