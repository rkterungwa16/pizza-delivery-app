
const Data = require('../../data')
const helpers = require('../../helpers')
const Mixin = require('../../mixins')
const Validation = require('../../validation')

const _data = new Data()

class ShoppingCart extends Mixin(Validation) {
  /**
   * Get a pizza item from menu
   *
   * @param {Object} data query string containing item id
   *
   * @return {Promise} Promise
   */
  get (data) {
    const id = typeof (data.queryStringObject.cartId) === 'string' &&
    data.queryStringObject.cartId.trim().length === 20
      ? data.queryStringObject.cartId.trim() : false

    return new Promise((resolve, reject) => {
      if (id) {
        const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
        return this._verifyToken(token)
          .then((validToken) => {
            if (validToken) {
              return _data.read('shopping-cart', id)
            }
          })
          .then((shoppingCartItemData) => {
            return resolve({
              statusCode: 200,
              payload: shoppingCartItemData
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
    const pizzaId = typeof (data.payload.pizzaId) === 'string' &&
    data.payload.pizzaId.trim() ? data.payload.pizzaId : false
    const quantity = typeof (data.payload.quantity) === 'number' ? data.payload.quantity : false

    const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
    let userData
    return new Promise((resolve, reject) => {
      if (
        pizzaId &&
        quantity
      ) {
        return this._verifyToken(token)
          .then((validToken) => {
            if (validToken) {
              return _data.read('users', validToken.email)
            }
          })
          .then((user) => {
            userData = user
            return _data.read('menu', pizzaId)
          })
          .then((menuItem) => {
            const shoppingCartItemId = helpers.createRandomString(20)
            const totalQuantity = menuItem.price * quantity
            const shoppingCartItem = {
              id: shoppingCartItemId,
              userEmail: userData.email,
              menuItem,
              quantity,
              totalQuantity,
              price: menuItem.price
            }
            _data.create('shopping-cart', shoppingCartItemId, shoppingCartItem)
            resolve({
              statusCode: 200,
              payload: shoppingCartItem
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

module.exports = ShoppingCart
