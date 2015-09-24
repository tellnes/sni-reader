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

  const contents = fs.readFileSync(file, 'utf8').split(/\r?\n/g)

  const stream = new PassThrough()
  stream.end(new Buffer(contents[0], 'hex'))

  sni(stream, function(err, sni) {
    if (err) throw err

    assert.equal(contents[1], sni)

    next()
  })
}
