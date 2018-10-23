const Server = require('./lib/server')
const helpers = require('./lib/helpers')
const server = new Server()

// helpers.makeStripePayment({
//   amount: 2000,
//   currency: 'usd',
//   source: 'tok_amex',
//   description: 'Charge for jenny.rosen@example.com'
// }).then((value) => {
//   console.log(' i made this', value)
// })
//   .catch((err) => {
//     console.log('payment not', err)
//   })
// helpers.sendEmail({
//   email: 'terungwakombol@gmail.com',
//   subject: 'Yea',
//   body: 'Sent to you boy'
// }).then((value) => {
//   console.log('yes it went', value)
// })
//   .catch((err) => {
//     console.log('no it did not', err)
//   })
const app = {}

app.init = () => {
  server.init()
}

app.init()

module.exports = app
