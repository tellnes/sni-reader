# sni-reader

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
