var createReadStream = require('fs').createReadStream
var createWriteStream = require('fs').createWriteStream
var path = require('path')
var spawn = require('child_process').spawn

var whichCB = require('which')
var Bluebird = require('bluebird')

var promisify = Bluebird.promisify
var mkdirp = promisify(require('mkdirp'))
var which = promisify(whichCB)

// I'm _definitely_ not writing a JS QT atom editor this year
function atomify (path, tags) {
  var args = [path]

  Object.keys(tags).forEach(function (k) {
    switch (k) {
      case 'title':
        args.push('--title')
        args.push(tags[k])
        break
      case 'artist':
        args.push('--artist')
        args.push(tags[k])
        break
      case 'album':
        args.push('--album')
        args.push(tags[k])
        break
      case 'track':
        args.push('--tracknum')
        args.push(tags[k])
        break
      case 'date':
        args.push('--year')
        args.push(tags[k])
        break
      case 'genre':
        args.push('--genre')
        args.push(tags[k])
    }
  })

  // AtomicParsley is VERY CAREFUL by default
  args.push('--overWrite')

  return which('AtomicParsley').then(function (bin) {
    return new Bluebird(function (resolve, reject) {
      var child = spawn(bin, args, { encoding: 'utf8' })

      var stdout = ''
      if (child.stdout) {
        child.stdout.on('data', function (chunk) {
          stdout += chunk
        })
      }

      var stderr = ''
      if (child.stderr) {
        child.stderr.on('data', function (chunk) {
          stderr += chunk
        })
      }

      child.on('error', reject)
      child.on('close', function (code) {
        if (code !== 0) return reject(new Error(stderr))
        resolve(stdout, stderr)
      })
    })
  })
}

function makeAlbum (root, tracks, source) {
  if (!source) source = path.resolve(__dirname, '../fixtures/empty.m4a')
  return Bluebird.map(tracks, makeTrack.bind(null, root, source))
}

function makeTrack (root, source, track) {
  return mkdirp(path.dirname(track.file.path)).then(function () {
    return new Bluebird(function (resolve, reject) {
      createReadStream(source)
        .on('error', reject)
        .pipe(createWriteStream(track.file.path))
        .on('error', reject)
        .on('finish', function () {
          var tags = {
            title: track.name,
            artist: track.artist.name,
            album: track.album.name,
            track: track.index,
            date: track.date
          }
          if (track.tags && track.tags.genre) tags.genre = track.tags.genre

          atomify(track.file.path, tags).return(track.file.path).then(resolve)
        })
    })
  })
}

module.exports = { makeAlbum: makeAlbum }
