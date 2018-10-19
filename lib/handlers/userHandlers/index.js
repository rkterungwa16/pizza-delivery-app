const Data = require('../../data')
const helpers = require('../../helpers')
const Mixin = require('../../mixins')
const Validation = require('../../validation')

const _data = new Data()

class Users extends Mixin(Validation) {
  /**
   * Get user info with specified email number
   *
   * @param {Object} data query string containing email number
   *
   * @return {Promise} Promise
   */
  get (data) {
    const email = typeof (data.queryStringObject.email) === 'string' &&
    data.queryStringObject.email.trim().length === 11
      ? data.queryStringObject.email.trim() : false

    return new Promise((resolve, reject) => {
      if (email) {
        const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
        return this._verifyToken(token, email)
          .then((tokenValid, err) => {
            if (tokenValid && !err) {
              return _data.read('users', email)
            }
          })
          .then((userData, err) => {
            if (err) {
              const userNotFoundError = new Error()
              userNotFoundError.message = {
                response: 'User does not exist'
              }

              userNotFoundError.statusCode = 404
              return Promise.reject(userNotFoundError)
            }
            delete userData.hashedPassword
            return resolve({
              statusCode: 200,
              payload: userData
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
    const name = this._verifyInputFieldData(data.payload.name)
    const address = this._verifyInputFieldData(data.payload.address)
    const email = this._verifyInputFieldData(data.payload.email)
    const password = this._verifyInputFieldData(data.payload.password)
    return new Promise((resolve, reject) => {
      if (
        name &&
        address &&
        email &&
        password
      ) {
        return _data.read('users', email)
          .then((value, err) => {
            const userExistsError = new Error()
            userExistsError.message = {
              response: 'A user with that email number already exists'
            }
            userExistsError.statusCode = 500
            return Promise.reject(userExistsError)
          }, (userErr) => {
            if (userErr) {
              const hashedPassword = helpers.hash(password)
              if (hashedPassword) {
                const userObject = {
                  name,
                  address,
                  email,
                  hashedPassword,
                  tosAgreement: true
                }

                return _data.create('users', email, userObject)
              }
              const hashError = new Error()
              hashError.message = 'Could not hash the user\'s password.'
              hashError.statusCode = 500
              return Promise.reject(hashError)
            }
          })
          .then(() => {
            return resolve({
              statusCode: 200,
              payload: {
                response: 'User successfully created'
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
        response: 'Missing required fields'
      }
      reject(missingFieldsError)
    })
  }

  /**
   * Update user details
   *
   * @param {Object} data user details
   * @return {Promise} Promise
   */
  put (data) {
    const email = this._verifyInputFieldData(data.payload.email)

    const name = this._verifyInputFieldData(data.payload.name)
    const address = this._verifyInputFieldData(data.payload.address)
    const password = this._verifyInputFieldData(data.payload.password)

    return new Promise((resolve, reject) => {
      if (email) {
        if (name || address || password) {
          const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
          return this._verifyToken(token, email)
            .then(() => {
              return _data.read('users', email)
            })
            .then((userData) => {
              if (name) {
                userData.name = name
              }

              if (address) {
                userData.address = address
              }

              if (password) {
                userData.hashedPassword = helpers.hash(password)
              }

              return _data.update('users', email, userData)
            })
            .then(() => {
              resolve({
                statusCode: 200,
                payload: {
                  response: 'User successfully updated'
                }
              })
            })
            .catch((err) => {
              reject(err)
            })
        }
        const missingOptionFieldsError = new Error()
        missingOptionFieldsError.message = {
          response: 'Missing fields to update'
        }

        missingOptionFieldsError.statusCode = 400
        reject(missingOptionFieldsError)
      } else {
        const missingFieldsError = new Error()

        missingFieldsError.message = {
          response: 'Missing required field'
        }

        missingFieldsError.statusCode = 400
        reject(missingFieldsError)
      }
    })
  }

  /**
   * Remove a specified user from storage
   *
   * @param {Object} data User details
   */
  delete (data) {
    const email = this._verifyInputFieldData(data.payload.email)
    return new Promise((resolve, reject) => {
      if (email) {
        const token = typeof (data.headers.token) === 'string' ? data.headers.token : false
        return this._verifyToken(token, email)
          .then(() => {
            return _data.read('users', email)
          })
          .then(() => {
            return _data.delete('users', email)
          })
          .then(() => {
            resolve({
              statusCode: 200,
              payload: {
                response: 'User successfully deleted'
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

module.exports = Users
