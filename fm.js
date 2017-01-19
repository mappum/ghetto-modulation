var radio = require('hackrf')()

function tx (data, done) {
  data.fill(127)
  done()
}

console.log('found radio: ' + radio.getVersion())
radio.setFrequency(1.5e9)
radio.startTx(tx)

setInterval(function () {
  console.log('stopping')
  radio.stopTx()
  var d = Math.random() * 2 - 1
  var f = 1.5e9 + d * 1e6
  console.log(f)
  radio.setFrequency(Math.floor(f))
  console.log('switched')
  radio.startTx(tx)
}, 1000)
