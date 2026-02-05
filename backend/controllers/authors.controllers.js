const express = require('express')
const { Blog } = require('../models/blogs.models')
const { fn, col, literal } = require('sequelize')

const AuthorsRouter = express.Router()

// GET /api/authors -> devuelve author, articles (count), likes (sum), ordenado por likes desc
AuthorsRouter.get('/api/authors', async (req, res, next) => {
  try {
    const authors = await Blog.findAll({
      attributes: [
        ['author', 'author'],
        [fn('COUNT', col('id')), 'articles'],
        [fn('COALESCE', fn('SUM', col('likes')), 0), 'likes']
      ],
      group: ['author'],
      order: [[literal('likes'), 'DESC']]
    })

    // Formatear resultado a objetos simples
    const result = authors.map(a => ({
      author: a.get('author'),
      articles: String(a.get('articles')),
      likes: String(a.get('likes'))
    }))

    res.json(result)
  } catch (err) {
    next(err)
  }
})

module.exports = AuthorsRouter
