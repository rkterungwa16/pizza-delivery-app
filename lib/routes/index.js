const handlers = require('../handlers')

const router = {
  'login': handlers.login,
  'users': handlers.users,
  'logout': handlers.logout
}

module.exports = router
