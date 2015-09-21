var Bluebird = require('bluebird')

var createWriteStream = require('fs').createWriteStream
var path = require('path')

var log = require('npmlog')
var rimraf = Bluebird.promisify(require('rimraf'))
var ZipFile = require('yazl').ZipFile

function pack (finishedPath, paths) {
  return new Bluebird(function (resolve, reject) {
    var zipper = new ZipFile()
    var zipped = createWriteStream(finishedPath)
                   .on('error', reject)
                   .on('close', resolve)
    zipper.outputStream.pipe(zipped)

    var root = path.dirname(finishedPath)
    log.silly('zip.pack', 'root', root)

    paths.forEach(function (trackPath) {
      var target = trackPath
      if (target.indexOf(root) === 0) {
        // need to strip the path separator
        target = target.slice(root.length + 1)
      }
      log.silly('zip.pack', 'entry path', target)
      zipper.addFile(trackPath, target)
    })
    zipper.end()
  }).then(function () {
    return Bluebird.each(paths, function (path) { return rimraf(path) })
  }).then(function () { return finishedPath })
}

module.exports = { pack: pack }
