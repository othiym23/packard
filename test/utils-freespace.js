var test = require('tap').test

var Bluebird = require('bluebird')

var freespace = require('../lib/utils/free-space.js').default

test('missing path', function (t) {
  t.throws(freespace)
  t.end()
})

test('basic contract', function (t) {
  return freespace('.')
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

test('extra-universe platform', function (t) {
  return Bluebird.resolve(['.', 'BeOS']).spread(freespace)
    .then(function () {
      t.fail("shouldn't have worked")
    })
    .catch(function (err) {
      t.match(err.message, 'Not yet implemented for BeOS')
    })
})
