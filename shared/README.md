# AppsWhat Shared

Shared dependencies used in AppsWhat.

## Setup

Required: [Node.js](https://nodejs.org)

1. Install dependencies.

  ```sh
  npm install
  ```

## Usage

### `AppsWhatClient`

#### Example

```js
const { AppsWhatClient } = require('../shared')

const client = new AppsWhatClient('http://load-balancer:8008', 'client-id')

client.on('connect', function() {
  client.subscribe('presence')
  client.publish('presence', {message: 'Hello World!'})
})

client.on('message', function(packet) {
  console.log(packet.topic)
  // presence
  console.log(packet.retain)
  // false
  console.log(packet.payload)
  // Object { message: 'Hello World!' }
})
```

#### Definitions

- `Payload`

  An `Object` representing a single message.

  ```js
  {
    id: 'unique-message-identifier',
    message: 'Message Content',
    senderId: 'IdOfSender',
    timestamp: 1525166271
  }
  ```

  `message` is set by the client during the publish. `id`, `senderId`, and `timestamp` are automatically included by the server.


#### API

- `AppsWhatClient(path, [clientId])`

  Creates an `AppsWhatClient` instance, requesting a server path from load balancer and connecting as `clientId`.

  - `path : String` to load balancer.
  - `clientId : String`, unique value used to persist session.

  Refer to [MQTT.js](https://github.com/mqttjs/MQTT.js/blob/master/README.md#mqttclientstreambuilder-options) for detailed information on emitted events. Note that the `'message'` event passes only the `packet` argument.

  ##### Event `'connect'`

  `function (connack) {}`

  ##### Event `'reconnect'`

  `function () {}`

  ##### Event `'close'`

  `function () {}`

  ##### Event `'offline'`

  `function () {}`

  ##### Event `'error'`

  `function (error) {}`

  ##### Event `'end'`

  `function () {}`

  ##### Event `'message'`

  `function (packet) {}`

  ##### Event `'packetsend'`

  `function (packet) {}`

  ##### Event `'packetreceive'`

  `function (packet) {}`

- `AppsWhatClient#publish(topic, data, [callback])`

  Publishes message to a topic. Messages are published with QoS 2 and positive retain flag.
  Returns a `Promise` if `callback` is not passed.

  - `topic : String`, the topic to publish to.
  - `data : Payload` of the message to publish.
  - `callback : function (error)`

- `AppsWhatClient#subscribe(topic, [callback])`

  Subscribes to a topic or topics.
  Returns a `Promise` if `callback` is not passed.

  - `topic : `
    - `String`, topic to subscribe to.
    - `Array` of topics to subscribe to.
    - `Object` with topic names as keys and QoS as values, e.g. `{'test1': 0, 'test2': 1}`.
  - `callback : function (error, granted)`
    - `granted : Array` of `{topic, QoS}`.
      - `topic : String` is a subscribed topic.
      - `QoS : Number` is the granted QoS level.

    MQTT topic wildcard characters are supported (`+` for single level and `#` for multi level).

- `AppsWhatClient#unsubscribe(topic, [callback])`

  Unsubscribes from a topic or topics.
  Returns a `Promise` if `callback` is not passed.

  - `topic : `
    - `String`, topic to unsubscribe from.
    - `Array` of topics to unsubscribe from.
  - `callback : function (error)`

- `AppsWhatClient#end([callback])`

  Closes the client.
  Returns a `Promise` if `callback` is not passed.

  - `callback : function ()`

- `AppsWhatClient#getUnread(topic, [start=BEGINNING], [end=LATEST], [callback])`

  Retrieves past messages sent in `topic` after `start` until before `end`.
  If `start` or `end` is not passed, assumes the maximum time span possible.
  Returns a `Promise` if `callback` is not passed.

  - `topic : String`, the topic.
  - `start : Payload`
    - `start.id : String`, required if specifying a starting point.
  - `end : Payload`
    - `end.id : String`, required if specifying an ending point.
  - `callback : function (error, payloads)`
    - `payloads : Array` of `Payload`s.
