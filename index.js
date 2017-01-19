var radio = require('hackrf')()
var bitfield = require('bitfield')

var BAUD_RATE = 1
var TIME_PER_BIT = 1000 / BAUD_RATE
var SYNC_PERIOD = 8000

radio.setFrequency(1.5e9)
radio.setSampleRate(10e6)
radio.setBandwidth(5e6)
radio.setLNAGain(40)
radio.setVGAGain(40)
radio.setTxGain(40)

function demod (radio, cb) {
  var total = 0
  var bytes = 0
  var low = Infinity
  var high = 0
  radio.startRx(function (data, done) {
    for (var i = 0; i < data.length; i++) {
      total += data[i]
    }
    bytes += data.length
    done()
  })
  setInterval(function () {
    var average = total / bytes
    if (average < low) low = average
    if (average > high) high = average
    var normalized = (average - low) / (high - low)
    normalized = Math.pow(normalized, 3)
    total = 0
    bytes = 0
    cb(normalized < 0.5)
  }, TIME_PER_BIT)
}

function mod (radio, message) {
  var bits = bitfield(message)
  var bitN = 0
  radio.startTx(function (data, done) {
    data.fill(bits.get(bitN) ? 127 : 0)
    done()
  })
  setInterval(function () {
    bitN++
    if (bitN === message.length * 8) bitN = 0
  }, TIME_PER_BIT)
}

var now = Date.now()
setTimeout(function () {
  mod(radio, new Buffer('hello, daviddias!\n'))
}, SYNC_PERIOD - now % SYNC_PERIOD)
