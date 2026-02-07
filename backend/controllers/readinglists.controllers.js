const express = require('express')
const { ReadingList } = require('../models/readinglists.models')
const { User } = require('../models/users.models')
const { Blog } = require('../models/blogs.models')

const ReadingListRouter = express.Router()

// Añadir un blog a la lista de lectura
ReadingListRouter.post('/api/readinglists', async (req, res, next) => {
    try {
        const { userId, blogId } = req.body
        if (!userId || !blogId) {
            const err = new Error('userId and blogId are required')
            err.status = 400
            return next(err)
        }

        // Verificar existencia de user y blog
        const user = await User.findByPk(userId)
        if (!user) {
            const err = new Error('User not found')
            err.status = 404
            return next(err)
        }
        const blog = await Blog.findByPk(blogId)
        if (!blog) {
            const err = new Error('Blog not found')
            err.status = 404
            return next(err)
        }

        // Use findOrCreate to avoid race conditions and unique constraint errors
        const [item, created] = await ReadingList.findOrCreate({ where: { userId, blogId }, defaults: { read: false } })
        if (!created) {
            return res.status(400).json({ error: ['Reading list entry already exists'] })
        }

        res.status(201).json(item)
    } catch (error) {
        next(error)
    }
})

module.exports = ReadingListRouter
