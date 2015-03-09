/*eslint-disable no-undef*/ // oh eslint
var Promise = require('bluebird')
/*eslint-enable no-undef*/

var createWriteStream = require('fs').createWriteStream
var path = require('path')

var ZipFile = require('yazl').ZipFile

function pack (finishedPath, paths) {
  return new Promise(function (resolve, reject) {
    var zipper = new ZipFile()
    var zipped = createWriteStream(finishedPath)
                   .on('error', reject)
                   .on('close', function () { resolve(finishedPath) })
    zipper.outputStream.pipe(zipped)

    paths.forEach(function (trackPath) {
      zipper.addFile(trackPath, path.basename(trackPath))
    })
    zipper.end()
  })
}

module.exports = { pack: pack }
