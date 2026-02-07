const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { User } = require('../models/users.models')
const { JWT_SECRET } = require('../config/util')

const LoginRouter = express.Router()

LoginRouter.post('/api/login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      const err = new Error('username and password required')
      err.status = 400
      return next(err)
    }

    const user = await User.findOne({ where: { username } })
    if (!user) {
      const err = new Error('invalid username or password')
      err.status = 401
      return next(err)
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash)
    if (!passwordOk) {
      const err = new Error('invalid username or password')
      err.status = 401
      return next(err)
    }

    // Prevent login for disabled users
    console.log('Login attempt: user.disabled =', user.disabled)
    if (user.disabled) {
      const err = new Error('user disabled')
      err.status = 401
      return next(err)
    }

    // create a jti for session tracking
    const { randomUUID } = require('crypto')
    const jti = randomUUID()

    const tokenPayload = {
      id: user.id,
      username: user.username,
      jti
    }

    // sign token with expiry
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' })

    // store session in db
    const { Session } = require('../models/sessions.models')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    let newSession = null
    try {
      newSession = await Session.create({ jti, userId: user.id, expiresAt })
      console.log('Created session id:', newSession.id)
    } catch (e) {
      console.error('Failed to create session:', e)
    }

    // Return token only
    res.json({ token, username: user.username, name: user.name })
  } catch (err) {
    next(err)
  }
})

// Logout: delete the active session (requires auth)
LoginRouter.delete('/api/logout', require('../utils/auth').authMiddleware, async (req, res, next) => {
  try {
    const { Session } = require('../models/sessions.models')
    if (req.jti) {
      await Session.destroy({ where: { jti: req.jti } })
    }
    // respond no content
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

module.exports = LoginRouter
