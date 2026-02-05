const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models/users.models');

const UserRouter = express.Router();

// Ruta para listar todos los usuarios
UserRouter.get('/api/users', async (req, res, next) => {
  try {
    const { Blog } = require('../models/blogs.models')
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Blog, attributes: ['id', 'author', 'title', 'url', 'likes'] }]
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Ruta para adicionar un nuevo usuario (ahora recibe `password` y lo hashea)
UserRouter.post('/api/users', async (req, res, next) => {
  try {
    const { username, name, password } = req.body;

    if (!password || password.length < 3) {
      const err = new Error('Password debe tener al menos 3 caracteres')
      err.status = 400
      return next(err)
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const newUser = await User.create({
      username,
      name,
      passwordHash
    });
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

// Agregar ruta PUT para actualizar el username por username
UserRouter.put('/api/users/:username', async (req, res, next) => {
  try {
    const { username } = req.params
    const { newUsername } = req.body

    if (!newUsername) {
      const err = new Error('El nuevo username no puede estar vacío')
      err.status = 400
      return next(err)
    }

    const user = await User.findOne({ where: { username } })
    if (!user) {
      const err = new Error('Usuario no encontrado')
      err.status = 404
      return next(err)
    }

    user.username = newUsername
    await user.save()

    // Enviar la representación pública sin passwordHash
    const { id, username: u, name, createdAt, updatedAt } = user
    res.json({ id, username: u, name, createdAt, updatedAt })
  } catch (error) {
    next(error)
  }
})

module.exports = UserRouter;