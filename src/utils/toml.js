/*eslint-disable no-undef*/ // oh eslint
const Promise = require('bluebird')
/*eslint-enable no-undef*/

const Transform = require('stream').Transform
const {isObject, isNumber} = require('util')

// let's see how ES6 classes deal with Node base classes
class TOMLStream extends Transform {
  constructor (...args) {
    super({objectMode: true})
  }

  _transform (chunk, encoding, cb) {
    if (!isObject(chunk)) {
      return cb(new Error(
        'unexpected type for chunk \'' + JSON.stringify(chunk) + '\''
      ))
    }

    Promise.map(Object.keys(chunk), key => {
      const value = chunk[key]
      if (!isNumber(value)) {
        throw new Error(
          'unexpected type for key \'' + key + '\': \'' + JSON.stringify(value) + '\''
        )
      }

      this.push(key + ' = ' + value + '\n')
    })
    .then(() => cb())
    .catch(cb)
  }
}

module.exports = { TOMLStream }
