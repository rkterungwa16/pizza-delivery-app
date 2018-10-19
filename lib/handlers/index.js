const UserHandler = require('./userHandlers')

const user = new UserHandler()
const handlers = {}

// Hello
handlers.hello = (data) => {
  return new Promise((resolve, reject) => {
    if (data) {
      resolve({
        statusCode: 200,
        data,
        payload: {
          response: 'Hello, how are you doing? Welcome to Nodejs Master class'
        }
      })
    }

    reject(new Error(406))
  })
}

// Not-Found
handlers.notFound = function () {
  return new Error(404)
}

/**
 * Map incoming user requests methods
 * to appropriate function
 * @param {Object} data user data
 */
handlers.users = (data) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  return new Promise((resolve, reject) => {
    if (acceptableMethods.indexOf(data.method) > -1) {
      // Resolve with results from crud methods
      return user[data.method](data)
        .then((data) => {
          resolve(data)
        })
        .catch(err => reject(err))
    }

    const methodNotAllowedError = new Error()
    methodNotAllowedError.statusCode = 405
    methodNotAllowedError.message = { response: 'Method not allowed' }
    reject(methodNotAllowedError)
  })
}

module.exports = handlers
