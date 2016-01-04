var test = require('tap').test

var blocksize = require('../lib/utils/block-size.js').default

test('missing path', function (t) {
  t.throws(blocksize)
  t.end()
})

test('basic contract', function (t) {
  return blocksize('.')
    .then(function (size) {
      t.ok(size > 0)
    })
})
