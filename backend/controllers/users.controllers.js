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

// Obtener un usuario por id incluyendo su lista de lectura
UserRouter.get('/api/users/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    // Incluir los blogs que están en la reading list del usuario
    const user = await User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{
        model: require('../models/blogs.models').Blog,
        as: 'readingList',
        attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
        through: { attributes: ['id', 'read'] }
      }]
    })

    if (!user) {
      const err = new Error('User not found')
      err.status = 404
      return next(err)
    }

    // DEBUG: log the shape of included readingList entries (remove after verification)
    if (user.readingList && user.readingList.length > 0) {
      console.log('DEBUG readingList sample:', JSON.stringify(user.readingList[0], Object.getOwnPropertyNames(user.readingList[0]), 2))
    }

    // Formatear la respuesta para ajustarse al formato pedido
    const { name, username } = user
    const blogIds = (user.readingList || []).map(b => b.id)

    // Obtener las filas de la tabla intermedia para este usuario y estos blogs
    const { ReadingList } = require('../models/readinglists.models')
    const joinRows = await ReadingList.findAll({ where: { userId: id, blogId: blogIds }, attributes: ['id', 'blogId', 'read'] })

    // DEBUG
    console.log('DEBUG blogIds:', blogIds)
    console.log('DEBUG joinRows count:', joinRows.length)
    console.log('DEBUG joinRows content:', joinRows.map(r => r.toJSON()))

    const joinByBlog = {}
    for (const jr of joinRows) {
      joinByBlog[jr.blogId] = { id: jr.id, read: jr.read }
    }

    const readings = (user.readingList || []).map(b => ({
      id: b.id,
      url: b.url,
      title: b.title,
      author: b.author,
      likes: b.likes,
      year: b.year,
      readinglists: joinByBlog[b.id] ? [joinByBlog[b.id]] : []
    }))

    res.json({ name, username, readings })
  } catch (error) {
    next(error)
  }
})

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