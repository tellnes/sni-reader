# sni-reader

[![Version npm](https://img.shields.io/npm/v/sni-reader.svg?style=flat-square)](https://www.npmjs.com/package/sni-reader)[![npm Downloads](https://img.shields.io/npm/dm/sni-reader.svg?style=flat-square)](https://www.npmjs.com/package/sni-reader)[![Build Status](https://img.shields.io/travis/tellnes/sni-reader/master.svg?style=flat-square)](https://travis-ci.org/tellnes/sni-reader)[![Coverage Status](https://img.shields.io/coveralls/tellnes/sni-reader/master.svg?style=flat-square)](https://coveralls.io/github/tellnes/sni-reader?branch=master)[![Dependencies](https://img.shields.io/david/tellnes/sni-reader.svg?style=flat-square)](https://david-dm.org/tellnes/sni-reader)[![Tips](http://img.shields.io/gratipay/tellnes.png?style=flat-square)](https://gratipay.com/~tellnes/)



`sni-reader` extracts the Server Name Indication from a raw TLS stream. It reads
the ClientHello message and extracts the value of the SNI extension if the
extension is present.


## Usage

```js
var net = require('net')
var sni = require('sni-reader')

const serverNameMap =
  { 'example.com': 8001
  , 'example.net': 8002
  }

net.createServer(function(socket) {
  sni(socket, function(err, serverName) {
    const port = serverNameMap[serverName]
    socket.pipe(net.connect(port)).pipe(socket)
  })
}).listen(80)
```


## Install

```bash
npm install -S sni-reader
```


## License

MIT
