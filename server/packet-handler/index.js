const PacketHandler = new require('./packet-handler')
const decode = require('./middlewares/decode')
const convertPayload = require('./middlewares/convert-payload')
const assignIdentifier = require('./middlewares/assign-identifier')
const setClientIdentifier = require('./middlewares/set-client-identifier')
const setTimestamp = require('./middlewares/set-timestamp')
const yodaSpeak = require('./middlewares/yoda-speak')
const log = require('./middlewares/log')
const encode = require('./middlewares/encode')

const packetHandler = new PacketHandler()

packetHandler.use(decode)
packetHandler.use(convertPayload)
packetHandler.use(assignIdentifier)
packetHandler.use(setClientIdentifier)
packetHandler.use(setTimestamp)
packetHandler.use(yodaSpeak)
packetHandler.use(log)
packetHandler.use(encode)

module.exports = packetHandler
