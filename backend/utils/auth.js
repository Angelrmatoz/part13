const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/util')

const authMiddleware = (req, res, next) => {
  const auth = req.get('authorization')
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    const err = new Error('token missing')
    err.status = 401
    return next(err)
  }

  const token = auth.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    err.status = 401
    return next(err)
  }
}

module.exports = { authMiddleware }
