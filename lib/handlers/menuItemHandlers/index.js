const Data = require('../../data')
// const helpers = require('../../helpers')
const Mixin = require('../../mixins')
const Validation = require('../../validation')

const _data = new Data()

class MenuItem extends Mixin(Validation) {
  /**
   * Get a pizza item from menu
   *
   * @param {Object} data query string containing item id
   *
   * @return {Promise} Promise
   */
  get (data) {
    const id = typeof (data.queryStringObject.id) === 'string' &&
    data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id.trim() : false

    return new Promise((resolve, reject) => {
      if (id) {
        const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
        return this._verifyToken(token, id)
          .then((tokenValid, err) => {
            if (tokenValid && !err) {
              return _data.read('menu', id)
            }
          })
          .then((menuData, err) => {
            if (err) {
              const menuItemNotFoundError = new Error()
              menuItemNotFoundError.message = {
                response: 'Item does not exist'
              }

              menuItemNotFoundError.statusCode = 404
              return Promise.reject(menuItemNotFoundError)
            }
            return resolve({
              statusCode: 200,
              payload: menuData
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

  // @TODO -- create post request for a menu item for an admin
  // As an admin I should be able to create menu item and edit menu item
}

module.exports = MenuItem
