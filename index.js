'use strict'

module.exports = function(socket, callback) {
  var readLength
  var readCallback
  var readBuffer = []

  socket.on('error', error)
  read(5, onHeader)

  function error(err) {
    socket.removeListener('readable', readable)
    finish(err)
  }

  function finish(err, sn) {
    socket.removeListener('error', error)

    for (var i = readBuffer.length - 1; i >= 0; i--) {
      socket.unshift(readBuffer[i])
    }
    readBuffer = null

    callback(err, sn)
  }

  function read(length, cb) {
    var chunk = socket.read(length)

    if (!chunk) {
      readLength = length
      readCallback = cb
      socket.once('readable', readable)
      return
    }

    readBuffer.push(chunk)
    cb(chunk)
  }

  function readable() {
    read(readLength, readCallback)
  }

  function onHeader(chunk) {
    var pos = 0

    // enum[255] ContentType
    var type = chunk[pos]
    pos += 1

    if (type !== 22) // Not TLS Handshake
      return finish()

    // ProtocolVersion
    pos += 2 // version

    // uint16 TLSPlaintext.length
    var length = chunk.readUInt16BE(pos)
    pos += 2

    read(length, onFragment)
  }

  function onFragment(chunk) {
    var pos = 0
    var length
    var value

    // enum[255] HandshakeType
    value = chunk[pos]
    pos += 1

    if (value !== 1) // Not ClientHello
      return finish()

    pos += 3 // Handshake.Length

    pos += 2 // ProtocolVersion
    pos += 28 // Random.random_bytes
    pos += 4 // Random.gmt_unix_time
    pos += 1 + chunk.readUInt8(pos) // SessionID
    pos += 2 + chunk.readUInt16BE(pos) // CipherSuite
    pos += 1 + chunk.readUInt8(pos) // CompressionMethod

    // Extension extensions<0..2^16-1>
    length = chunk.readUInt16BE(pos)
    pos += 2

    if (!length) // No extensions
      return finish()

    // The rest of the handshake should be extensions
    if (length !== chunk.length - pos)
      return finish() // Protocol error

    // Loop throught extensions
    while (pos < chunk.length) {
      // enum ExtensionType
      value = chunk.readInt16BE(pos)
      pos += 2

      // uint16 Extension.extension_data.length
      length = chunk.readUInt16BE(pos)
      pos += 2

      if (value !== 0) { // some other extension
        pos += length
        continue
      }

      // uint16 ServerNameList.length
      length = chunk.readUInt16BE(pos)
      pos += 2

      // enum NameType
      value = chunk[pos]
      pos += 1

      if (value !== 0)
        return finish() // Unknown Name Type

      // uint16 HostName.length
      length = chunk.readUInt16BE(pos)
      pos += 2

      // opaque HostName
      value = chunk.toString('utf8', pos, pos + length)
      return finish(null, value)
    }

    // SNI Not present
    finish()
  }
}
