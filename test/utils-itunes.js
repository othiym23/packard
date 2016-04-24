var test = require('tap').test

var parseGapless = require('../lib/utils/itunes.js').parseGapless
var parseNormalization = require('../lib/utils/itunes.js').parseNormalization

test('parseGapless', function (t) {
  var iTunSMPB = '00000000 00000840 000001CA 00000000003F31F6 ' +
    '00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000'
  t.same(
    parseGapless(iTunSMPB),
    {
      encoderDelaySamples: 2112,
      endPaddingSamples: 458,
      originalSampleCount: 4141558,
      raw: iTunSMPB
    }
  )
  t.end()
})

test('parseNormalization', function (t) {
  var iTunNORM = '00000035 00000000 ' +
    '000000F2 00000000 ' +
    '0000B2F1 00000000 ' +
    '00001351 00000000 ' +
    '00004CD4 00000000'
  t.same(
    parseNormalization(iTunNORM),
    {
      adjustment1000L: 53,
      adjustment1000R: 0,
      adjustment2500L: 242,
      adjustment2500R: 0,
      statisticsL: 45809,
      statisticsR: 0,
      peakL: 4945,
      peakR: 0,
      unknownL: 19668,
      unknownR: 0,
      raw: iTunNORM
    }
  )
  t.end()
})
