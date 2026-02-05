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

    const tokenPayload = {
      id: user.id,
      username: user.username
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' })
    res.json({ token, username: user.username, name: user.name })
  } catch (err) {
    next(err)
  }
})

module.exports = LoginRouter
