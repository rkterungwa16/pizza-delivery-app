const handlers = require('../handlers')

const router = {
  'login': handlers.login,
  'users': handlers.users,
  'logout': handlers.logout,
  'menu-item': handlers.menuItem,
  'all-menu-items': handlers.allMenuItems,
  'shopping-cart-item': handlers.shoppingCartItem
}

module.exports = router
