var test = require('tap').test

var isCruft = require('../lib/utils/cruft.js').default

test("cruft doesn't care if you pass it garbage", function (t) {
  t.notOk(isCruft())
  t.notOk(isCruft(null))
  t.notOk(isCruft(undefined))
  t.notOk(isCruft(false))
  t.notOk(isCruft(0))
  t.end()
})

test('things are crufty', function (t) {
  t.ok(isCruft('.DS_Store'))
  t.ok(isCruft('/usr/local/staging/Low/I Could Live In Hope/covers/Thumbs.db'))
  t.ok(isCruft('.AppleDouble/01 - Low - I Could Live In Hope.mp3'))
  t.ok(isCruft('__MACOSX/low-ones_and_sixes-flac/._sp1144-01_gentle.flac'))
  t.ok(isCruft('__MACOSX/._.DS_Store'))
  t.ok(isCruft('tracks/._01 - Low - I Could Live In Hope - Words.mp3'))
  t.end()
})

test('things are not crufty', function (t) {
  t.notOk(isCruft('/usr/local/staging/Low/I Could Live In Hope/01 Words.mp3'))
  t.notOk(isCruft('low-ones_and_sixes-flac/sp1144-01_gentle.flac'))
  t.notOk(isCruft('tracks/01 - Low - I Could Live In Hope - Words.mp3'))
  t.end()
})
