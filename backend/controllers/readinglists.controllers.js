const express = require('express')
const { ReadingList } = require('../models/readinglists.models')
const { User } = require('../models/users.models')
const { Blog } = require('../models/blogs.models')
const { authMiddleware } = require('../utils/auth')

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

// Marcar como leído/desmarcar: solo el usuario propietario puede hacerlo
ReadingListRouter.put('/api/readinglists/:id', authMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id
        const { read } = req.body
        if (typeof read !== 'boolean') {
            const err = new Error('read must be a boolean')
            err.status = 400
            return next(err)
        }

        const item = await ReadingList.findByPk(id)
        if (!item) {
            const err = new Error('Reading list entry not found')
            err.status = 404
            return next(err)
        }

        // Only owner can update
        if (item.userId !== req.user.id) {
            const err = new Error('Not authorized')
            err.status = 401
            return next(err)
        }

        item.read = read
        await item.save()
        res.json({ id: item.id, userId: item.userId, blogId: item.blogId, read: item.read })
    } catch (error) {
        next(error)
    }
})

// Dev helper: get a reading list entry by id (debug)
ReadingListRouter.get('/api/readinglists/:id', async (req, res, next) => {
    try {
        const id = req.params.id
        const item = await ReadingList.findByPk(id)
        if (!item) {
            const err = new Error('Reading list entry not found')
            err.status = 404
            return next(err)
        }
        res.json(item)
    } catch (err) {
        next(err)
    }
})

module.exports = ReadingListRouter
