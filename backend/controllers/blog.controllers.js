const express = require('express')
const { Blog } = require('../models/blogs.models')
const { User } = require('../models/users.models')
const { authMiddleware } = require('../utils/auth')
const { Op } = require('sequelize')

const BlogRouter = express.Router()

// Lista todos los blogs incluyendo el usuario que los creó
BlogRouter.get('/api/blogs', async (req, res, next) => {
  try {
    const { search } = req.query
    let where
    if (search) {
      const pattern = `%${search}%`
      where = {
        [Op.or]: [
          { title: { [Op.iLike]: pattern } },
          { author: { [Op.iLike]: pattern } }
        ]
      }
    }

    const blogs = await Blog.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'username', 'name'] }],
      order: [['likes', 'DESC']]
    })
    res.json(blogs)
  } catch (error) {
    next(error)
  }
});

// Crear un nuevo blog: requiere token y asocia el blog al usuario autenticado
BlogRouter.post('/api/blogs', authMiddleware, async (req, res, next) => {
  try {
    const { author, url, title, likes } = req.body
    const userId = req.user.id

    const newBlog = await Blog.create({
      author,
      url,
      title,
      likes: likes ?? 0,
      userId
    })

    res.status(201).json(newBlog)
  } catch (error) {
    next(error)
  }
});

// Eliminar un blog: sólo el usuario que lo creó puede eliminarlo
BlogRouter.delete('/api/blogs/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const blog = await Blog.findByPk(id)
    if (!blog) {
      const err = new Error('Blog no encontrado')
      err.status = 404
      return next(err)
    }

    if (blog.userId !== userId) {
      const err = new Error('No autorizado')
      err.status = 401
      return next(err)
    }

    await Blog.destroy({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
});

BlogRouter.put('/api/blogs/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { likes } = req.body

    if (typeof likes !== 'number') {
      const err = new Error('El campo likes debe ser un número')
      err.status = 400
      return next(err)
    }

    const blog = await Blog.findByPk(id)
    if (!blog) {
      const err = new Error('Blog no encontrado')
      err.status = 404
      return next(err)
    }

    blog.likes = likes
    await blog.save()
    res.json(blog)
  } catch (error) {
    next(error)
  }
});

module.exports = BlogRouter
