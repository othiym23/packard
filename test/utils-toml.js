var concat = require('concat-stream')
var test = require('tap').test
var JSONStream = require('JSONStream')
var TOMLStream = require('../lib/utils/toml.js').TOMLStream

test('emitting streaming JSON', function (t) {
  var stream = JSONStream.stringify()
  stream.pipe(concat(function (output) {
    t.equals(output, '[\n{"number":314}\n]\n', 'got expected output')
    t.end()
  }))
  stream.on('error', function (er) {
    t.ifError(er, "shouldn't have failed to write a stream this simple")
  })

  stream.end({number: 314})
})

test('emitting streaming TOML', function (t) {
  t.test('with one value', function (t) {
    var stream = new TOMLStream()
    stream.pipe(concat(function (output) {
      t.equals(output, 'number = 314\n', 'got expected output')
      t.end()
    }))
    stream.on('error', function (er) {
      t.ifError(er, "shouldn't have failed to write a stream this simple")
    })

    stream.end({number: 314})
  })

  t.test('with threeve values', function (t) {
    var stream = new TOMLStream()
    stream.pipe(concat(function (output) {
      t.equals(
        output,
        'number1 = 314\nnumber2 = 415\nnumber3 = 303\nnumber4 = 808\n',
        'got expected output'
      )
      t.end()
    }))
    stream.on('error', function (er) {
      t.ifError(er, "shouldn't have failed to write a stream this simple")
    })

    stream.end({number1: 314, number2: 415, number3: 303, number4: 808})
  })

  t.end()
})

test('confusing streaming TOML', function (t) {
  t.test('at the chunk level', function (t) {
    var stream = new TOMLStream()
    stream.on('error', function (er) {
      t.equal(
        er.message,
        'unexpected type for chunk \'"eventually I will be a comment"\'',
        'failed in the expected way'
      )
      t.end()
    })

    stream.pipe(concat(function (output) {
      t.fail("shouldn't have gotten any output")
    }))

    stream.end('eventually I will be a comment')
  })

  t.test('at the value level', function (t) {
    var stream = new TOMLStream()
    stream.on('error', function (er) {
      t.equal(
        er.message,
        'unexpected type for key \'number\': \'"ham"\'',
        'failed on ham, so sad'
      )
      t.end()
    })

    stream.pipe(concat(function (output) {
      t.fail("shouldn't have gotten any output")
    }))

    stream.end({number: 'ham'})
  })

  t.end()
})
