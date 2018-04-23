const { decode } = require('msgpack-lite')

module.exports = function(client, packet, next) {
  next({
    ...packet,
    payload: decode(packet.payload),
  })
}
