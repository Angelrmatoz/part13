const express = require('express')
const { Blog } = require('../models/blogs.models')

const BlogRouter = express.Router()

// Ruta para listar todos los blogs
BlogRouter.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.findAll()
    res.json(blogs)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los blogs' })
  }
})

// Ruta para adicionar un nuevo blog
BlogRouter.post('/api/blogs', async (req, res) => {
  try {
    const { author, url, title, likes } = req.body
    const newBlog = await Blog.create({
      author,
      url,
      title,
      likes: likes ?? 0
    })
    res.status(201).json(newBlog)
  } catch (error) {
    res.status(400).json({ error: 'Error al crear el blog' })
  }
})

// Ruta para eliminar un blog por id
BlogRouter.delete('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Blog.destroy({ where: { id } })
    if (deleted) {
      res.status(204).send()
    } else {
      res.status(404).json({ error: 'Blog no encontrado' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el blog' })
  }
})

module.exports = BlogRouter
