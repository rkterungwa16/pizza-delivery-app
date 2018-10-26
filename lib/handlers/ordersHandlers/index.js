
const Data = require('../../data')
const helpers = require('../../helpers')
const Mixin = require('../../mixins')
const Validation = require('../../validation')
const config = require('../../../config')

const _data = new Data()

class Orders extends Mixin(Validation) {
  /**
   * Get all orders of a specific user
   *
   * @param {Object} data query string containing item id
   *
   * @return {Promise} Promise
   */
  get (data) {
    const id = typeof (data.queryStringObject.userId) === 'string' &&
    data.queryStringObject.cartId.trim().length === 20
      ? data.queryStringObject.cartId.trim() : false

    return new Promise((resolve, reject) => {
      if (id) {
        const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
        return this._verifyToken(token)
          .then((validToken) => {
            if (validToken) {
              return _data.read('orders', id)
            }
          })
          .then((OrdersItemData) => {
            return resolve({
              statusCode: 200,
              payload: OrdersItemData
            })
          })
          .catch((err) => {
            reject(err)
          })
      }

      const missingFieldsError = new Error()
      missingFieldsError.message = {
        response: 'Missing required field'
      }
      missingFieldsError.statusCode = 404
      reject(missingFieldsError)
    })
  }

  /**
   * Create a new user
   * @param {Object} data
   */
  post (data) {
    const shippingAddress = typeof (data.payload.shippingAddress) === 'string'
      ? data.payload.shippingAddress : false

    const status = typeof (data.payload.status) === 'string' &&
    data.payload.status === 'created'
      ? data.payload.shippingAddress : false

    const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
    let userData
    let subTotal
    let cartMenuItems
    let order
    return new Promise((resolve, reject) => {
      if (
        shippingAddress &&
        status
      ) {
        return this._verifyToken(token)
          .then((validToken) => {
            if (validToken) {
              return _data.read('users', validToken.email)
            }
          })
          .then((user) => {
            userData = user
            return _data.readAllFileContentsInDir('shopping-cart')
          })
          .then((cartItems) => {
            cartMenuItems = cartItems
            subTotal = cartItems.reduce((prevPrice, cartItem) => {
              return JSON.parse(cartItem).totalQuantity + prevPrice
            }, 0)

            return helpers.makeStripePayment({
              amount: subTotal,
              currency: 'usd',
              description: 'Charge for order',
              source: config.stripe.token // config.stripe.apiKey
            })
          })
          .then(() => {
            return helpers.sendEmail({
              email: userData.email,
              subject: 'Order successful',
              body: 'Your order has been successfully placed'
            })
          })
          .then(() => {
            const orderId = helpers.createRandomString(20)
            order = {
              id: orderId,
              userEmail: userData.email,
              noOfPizza: cartMenuItems.length,
              subTotal,
              shippingAddress
            }

            return _data.create('orders', orderId, order)
          })
          .then(() => {
            return resolve({
              statusCode: 200,
              payload: {
                response: order
              }
            })
          })
          .catch((err) => {
            resolve(err)
          })
      }

      const missingFieldsError = new Error()
      missingFieldsError.statusCode = 400
      missingFieldsError.message = {
        response: 'Missing required fields'
      }
      reject(missingFieldsError)
    })
  }
}

module.exports = Orders
