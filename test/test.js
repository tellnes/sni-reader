'use strict'

const sni = require('../')
const PassThrough = require('stream').PassThrough
const path = require('path')
const fs = require('fs')
const assert = require('assert')

const dir = path.join(__dirname, 'fixtures')

const files = fs.readdirSync(dir).map(function(file) {
  return path.join(dir, file)
})

next()

function next() {
  const file = files.shift()
  if (!file) return

  console.log(file)

  const contents = fs.readFileSync(file, 'utf8').split(/\r?\n/g)

  testNormal(contents, function() {
    testOneAndOne(contents, function() {
      testRandom(contents, next)
    })
  })
}

function testNormal(contents, cb) {
  const stream = new PassThrough()
  stream.end(new Buffer(contents[0], 'hex'))
  run(stream, contents[1], cb)
}

function testOneAndOne(contents, cb) {
  var index = 0
  function write() {
    stream.write(contents[0][index] + contents[0][index + 1], 'hex')
    index += 2

    if (index < contents[0].length)
      setImmediate(write)
    else
      stream.end()
  }

  const stream = new PassThrough()
  write()
  run(stream, contents[1], cb)
}

function testRandom(contents, cb) {
  var index = 0
  function write() {
    var length
    length = (Math.random() * (contents[0].length / 100 * 5) | 0)
    if (length < 2) length = 2
    if (length % 2) length++
    length = Math.min(contents[0].length, length)

    stream.write(contents[0].slice(index, index + length), 'hex')
    index += length

    if (index < contents[0].length)
      setImmediate(write)
    else
      stream.end()
  }

  const stream = new PassThrough()
  write()
  run(stream, contents[1], cb)
}


function run(stream, result, cb) {
  sni(stream, function(err, hostname) {
    if (err) {
      if (result === 'protocol error') {
        assert(err instanceof sni.ProtocolError)
        assert(err instanceof Error)
      } else {
        assert.ifError(err)
      }
    } else {
      assert.equal(result, hostname)
    }

    cb()
  })
}
