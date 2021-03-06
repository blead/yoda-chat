const EventEmitter = require('events')
const mqtt = require('mqtt')
const request = require('then-request')
const syncRequest = require('sync-request')
const { encode, decode } = require('msgpack-lite')
const { resolve: urlResolve } = require('url')

const optionalPromise = (fn, ...args) => {
  const callback = args.pop()
  if(typeof callback === 'function') {
    fn(...args, callback)
  } else {
    return new Promise((resolve, reject) => fn(...args, error => error ? reject(error) : resolve()))
  }
}

class AppsWhatClient extends EventEmitter {
  constructor(path, clientId) {
    super()

    const options = clientId ? { clientId, clean: false } : {}
    this.path = path
    this.serverUrl = 'server'

    console.log(`connecting to ${path}`)
    this._getServerUrl(path).then(url => {
      console.log(`connecting to ${url}`)
      this.serverUrl = url
      this.client = mqtt.connect(url, Object.assign({}, options, {
        transformWsUrl: () => this._getServerUrlSynchronous(path),
      }))

      this.client.on('message', (topic, message, packet) => {
        this.emit('message', Object.assign({}, packet, {
          payload: packet.payload ? decode(packet.payload) : packet.payload
        }))
      })

      ;['packetsend', 'packetreceive'].forEach(event => this.client.on(event, packet => {
        this.emit(event, Object.assign({}, packet, {
          payload: packet.payload ? decode(packet.payload) : packet.payload
        }))
      }))

      ;['connect', 'reconnect', 'close', 'offline', 'error', 'end'].forEach(event => {
        this.client.on(event, (...args) => this.emit(event, ...args))
      })
    })
  }

  publish(topic, data, callback) {
    const encodedData = encode(data)
    const options = { qos: 2, retain: true }
    return optionalPromise(this.client.publish.bind(this.client), topic, encodedData, options, callback)
  }

  subscribe(topic, callback) {
    return optionalPromise(this.client.subscribe.bind(this.client), topic, callback)
  }

  unsubscribe(topic, callback) {
    return optionalPromise(this.client.unsubscribe.bind(this.client), topic, callback)
  }

  end(callback) {
    return optionalPromise(this.client.end.bind(this.client), callback)
  }

  getUnread(topic, ...args) {
    const callback = args.pop()
    const [ start, end ] = args

    const req = request('GET', urlResolve(this.path, '/messages'), {
      qs: {
        topic,
        start: start ? start.id : undefined,
        end: end ? end.id : undefined,
      },
      retry: true,
      timeout: 30000,
    }).getBody('utf8').then(JSON.parse).then((payloads) => {
      if(callback) {
        callback(null, payloads)
      } else {
        return payloads
      }
    }).catch(error => {
      if(callback) {
        callback(error, [])
      } else {
        throw error
      }
    })

    if(!callback) {
      return req
    }
  }

  _getServerUrl(path) {
    return request('GET', path, { retry: true, timeout: 30000 }).getBody('utf8')
  }

  _getServerUrlSynchronous(path) {
    return syncRequest('GET', path, { retry: true, timeout: 30000 }).getBody('utf8')
  }
}

module.exports = AppsWhatClient
