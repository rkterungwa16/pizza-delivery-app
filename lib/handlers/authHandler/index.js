const Data = require('../../data')
const helpers = require('../../helpers')
const Mixin = require('../../mixins')
const Validation = require('../../validation')

const _data = new Data()

class Authentication extends Mixin(Validation) {
  /**
   * Get token info with specified id
   *
   * @param {Object} data query string containing id
   *
   * @return {Promise} Promise
   */
  get (data) {
    const id = typeof (data.queryStringObject.id) === 'string' &&
    data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id.trim() : false

    return new Promise((resolve, reject) => {
      if (id) {
        return _data.read('tokens', id)
          .then((tokenData) => resolve({
            statusCode: 200,
            payload: tokenData
          }))
          .catch(() => {
            const tokenNotFoundError = new Error()
            tokenNotFoundError.message = {
              response: 'Token does not exist'
            }

            tokenNotFoundError.statusCode = 404
            reject(tokenNotFoundError)
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
   * Create a new token
   * @param {Object} data
   */
  post (data) {
    const emailFilter = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/
    const email = typeof (data.payload.email) === 'string' &&
    emailFilter.test(data.payload.email)
      ? data.payload.email : false

    const password = this._verifyInputFieldData(data.payload.password)

    return new Promise((resolve, reject) => {
      if (
        email &&
        password
      ) {
        return _data.read('users', email)
          .then((value) => {
            const hashedPassword = helpers.hash(password)
            if (hashedPassword === value.hashedPassword) {
              const tokenId = helpers.createRandomString(20)
              const expires = Date.now() + 1000 * 60 * 60
              const tokenObject = {
                email,
                id: tokenId,
                expires: expires
              }
              return _data.create('tokens', tokenId, tokenObject)
            }

            const passwordMatchError = new Error()
            passwordMatchError.message = {
              response: 'Password did not match the specified user\'s stored password'
            }
            passwordMatchError.statusCode = 400
            return reject(passwordMatchError)
          })
          .then(() => {
            return resolve({
              statusCode: 200,
              payload: {
                response: {
                  message: 'token successfully created'
                }
              }
            })
          })
          .catch((err) => {
            reject(err)
          })
      }

      const missingFieldsError = new Error()
      missingFieldsError.statusCode = 400
      missingFieldsError.message = {
        response: 'Missing required field(s)'
      }
      reject(missingFieldsError)
    })
  }

  /**
   * Update token details
   *
   * @param {Object} data token details
   * @return {Promise} Promise
   */
  put (data) {
    const id = this._verifyInputFieldData(data.payload.id)

    const extend = this._verifyInputFieldData(data.payload.extend)

    return new Promise((resolve, reject) => {
      if (id && extend) {
        return _data.read('tokens', id)
          .then((tokenData) => {
            if (tokenData.expires > Date.now()) {
              tokenData.expires = Date.now() + 1000 * 60 * 60
              return _data.update('tokens', id, tokenData)
            }
            const tokenExpiryError = new Error()
            tokenExpiryError.statusCode = 400
            tokenExpiryError.message = {
              response: 'The token has already expired, and cannot be extended.'
            }

            reject(tokenExpiryError)
          })
          .then(() => {
            resolve({
              statusCode: 200,
              payload: {
                response: 'Token successfully updated'
              }
            })
          })
          .catch(() => {
            const userNotFoundError = new Error()
            userNotFoundError.message = {
              response: 'Specified user does not exist'
            }

            userNotFoundError.statusCode = 400
            reject(userNotFoundError)
          })
      }

      const missingFieldsError = new Error()
      missingFieldsError.message = {
        response: 'Missing required field'
      }

      missingFieldsError.statusCode = 400
      return reject(missingFieldsError)
    })
  }

  /**
   * Remove a specified token from storage
   *
   * @param {Object} data Token details
   */
  delete (data) {
    const id = this._verifyInputFieldData(data.queryStringObject.id)
    return new Promise((resolve, reject) => {
      if (id) {
        return _data.read('tokens', id)
          .then(() => {
            _data.delete('tokens', id)
          })
          .then(() => {
            resolve({
              statusCode: 200,
              payload: {
                response: 'Token successfully deleted'
              }
            })
          })
          .catch((err) => {
            reject(err)
          })
      }

      const missingFieldsError = new Error()
      missingFieldsError.statusCode = 400
      missingFieldsError.message = {
        response: 'Missing required field'
      }
      reject(missingFieldsError)
    })
  }
}

module.exports = Authentication
