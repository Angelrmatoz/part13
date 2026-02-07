const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/util')

const authMiddleware = async (req, res, next) => {
  const auth = req.get('authorization')
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    const err = new Error('token missing')
    err.status = 401
    return next(err)
  }

  const token = auth.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    // decoded should contain jti claim
    req.user = decoded
    req.jti = decoded.jti || decoded.jti // might be undefined if token not issued with jti

    // If token has no jti we can't validate server session
    if (!req.jti) {
      const err = new Error('token missing id')
      err.status = 401
      return next(err)
    }

    // Verify session exists and is still valid
    const { Session } = require('../models/sessions.models')
    const session = await Session.findOne({ where: { jti: req.jti } })
    if (!session) {
      const err = new Error('invalid session')
      err.status = 401
      return next(err)
    }

    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      // session expired, remove it
      await Session.destroy({ where: { jti: req.jti } })
      const err = new Error('session expired')
      err.status = 401
      return next(err)
    }

    // Also verify user is not disabled
    const { User } = require('../models/users.models')
    const user = await User.findByPk(decoded.id)
    if (!user) {
      const err = new Error('user not found')
      err.status = 401
      return next(err)
    }

    if (user.disabled) {
      const err = new Error('user disabled')
      err.status = 401
      return next(err)
    }

    // Attach session and user to request for convenience
    req.session = session
    req.userRow = user

    next()
  } catch (err) {
    err.status = 401
    return next(err)
  }
}

module.exports = { authMiddleware }
