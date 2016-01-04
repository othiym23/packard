var test = require('tap').test

var Bluebird = require('bluebird')

var freeBlocksFromPath = require('../lib/utils/free-space.js').default

test('missing path', function (t) {
  t.throws(freeBlocksFromPath)
  t.end()
})

test('basic contract', function (t) {
  return freeBlocksFromPath('.')
    .then(function (f) {
      t.isa(f.dev, 'string')
      t.isa(f.total, 'number')
      t.isa(f.used, 'number')
      t.isa(f.available, 'number')
      t.isa(f.capacity, 'string')
      t.isa(f.mountpoint, 'string')
      t.ok(f.total > 0)
      t.ok(f.used > 0)
      // available might be dicey for me some of the time
    })
})

test('weird block size', function (t) {
  // freeBlocksFromPath throws synchronously on unsupported input, so put the
  // call in the promise box first
  return Bluebird.resolve(['.', -1]).spread(freeBlocksFromPath)
    .then(function () {
      t.fail("shouldn't have worked")
    })
    .catch(function (err) {
      t.match(err.message, 'expect confirmation of block size')
    })
})

test('extra-universe platform', function (t) {
  // freeBlocksFromPath throws synchronously on unsupported input, so put the call in
  // the promise box first
  return Bluebird.resolve(['.', undefined, 'BeOS']).spread(freeBlocksFromPath)
    .then(function () {
      t.fail("shouldn't have worked")
    })
    .catch(function (err) {
      t.match(err.message, 'Not yet implemented for BeOS')
    })
})
