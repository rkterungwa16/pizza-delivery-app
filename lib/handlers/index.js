const UserHandler = require('./userHandlers')
const AuthHandler = require('./authHandler')
const MenuItem = require('./menuItemHandlers')
const AllMenuItems = require('./allMenuItemsHandlers')
const ShoppingCartItem = require('./shoppingCartHandlers')

const user = new UserHandler()
const auth = new AuthHandler()
const menuItem = new MenuItem()
const allMenuItems = new AllMenuItems()
const shoppingCartItem = new ShoppingCartItem()
const handlers = {}

// @TODO handler to get all menu items

// Hello
handlers.login = (data) => {
  return new Promise((resolve, reject) => {
    auth.post(data)
      .then((data) => {
        resolve(data)
      })
      .catch(err => reject(err))
  })
}

handlers.logout = (data) => {
  return new Promise((resolve, reject) => {
    auth.delete(data)
      .then((data) => {
        resolve(data)
      })
      .catch(err => reject(err))
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

/**
 * Map incoming user requests for shopping cart item methods
 * to appropriate function
 * @param {Object} data user data
 */
handlers.shoppingCartItem = (data) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete']
  return new Promise((resolve, reject) => {
    if (acceptableMethods.indexOf(data.method) > -1) {
      // Resolve with results from crud methods
      return shoppingCartItem[data.method](data)
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

/**
 * Map incoming menu item requests methods
 * to appropriate function
 * @param {Object} data menu item data
 */
handlers.menuItem = (data) => {
  const acceptableMethods = ['get']
  return new Promise((resolve, reject) => {
    if (acceptableMethods.indexOf(data.method) > -1) {
      return menuItem[data.method](data)
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

/**
 * Map incoming request for all menu items
 * to appropriate function
 * @param {Object} data menu item data
 */
handlers.allMenuItems = (data) => {
  const acceptableMethods = ['get']
  return new Promise((resolve, reject) => {
    if (acceptableMethods.indexOf(data.method) > -1) {
      return allMenuItems[data.method](data)
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
