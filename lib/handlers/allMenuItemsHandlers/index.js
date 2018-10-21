const Data = require('../../data')
// const helpers = require('../../helpers')
const Mixin = require('../../mixins')
const Validation = require('../../validation')

const _data = new Data()

class AllMenuItems extends Mixin(Validation) {
  /**
   * Get a pizza item from menu
   *
   * @param {Object} data query string containing item id
   *
   * @return {Promise} Promise
   */
  get (data) {
    return new Promise((resolve, reject) => {
      const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
      return this._verifyToken(token)
        .then((tokenValid, err) => {
          if (tokenValid && !err) {
            return _data.list('menu')
          }
        })
        .then((menuData, err) => {
          if (err) {
            const MenuNotFoundError = new Error()
            MenuNotFoundError.message = {
              response: 'Item does not exist'
            }

            MenuNotFoundError.statusCode = 404
            return Promise.reject(MenuNotFoundError)
          }
          return resolve({
            statusCode: 200,
            payload: menuData
          })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  // @TODO -- create post request for a menu item
}

module.exports = AllMenuItems
