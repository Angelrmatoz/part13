const bcrypt = require('bcrypt')
const { sequelize } = require('../config/database')
const { User } = require('../models/users.models')
const { Blog } = require('../models/blogs.models')

async function seed() {
    await sequelize.authenticate()
    // Limpiar tablas (usamos TRUNCATE en ambas tablas a la vez para evitar errores por claves foráneas)
    await sequelize.query('TRUNCATE TABLE "blogs", "users" RESTART IDENTITY CASCADE')
    const usersData = [
        {
            username: 'alice@example.com',
            name: 'Alice',
            password: 'alicepass'
        },
        {
            username: 'bob@example.com',
            name: 'Bob',
            password: 'bobpass'
        },
        {
            username: 'carol@example.com',
            name: 'Carol',
            password: 'carolpass'
        }
    ]

    const users = []
    for (const u of usersData) {
        const passwordHash = await bcrypt.hash(u.password, 10)
        users.push(await User.create({ username: u.username, name: u.name, passwordHash }))
    }

    // Crear blogs
    const blogsData = [
        {
            author: 'Alice',
            url: 'https://aliceblog.com',
            title: 'Primer blog de Alice',
            likes: 5,
            year: 2020,
            userId: users[0].id
        },
        {
            author: 'Bob',
            url: 'https://bobblog.com',
            title: 'Bob opina sobre JS',
            likes: 8,
            year: 2021,
            userId: users[1].id
        },
        {
            author: 'Carol',
            url: 'https://carolblog.com',
            title: 'Carol y Node.js',
            likes: 3,
            year: 2019,
            userId: users[2].id
        },
        {
            author: 'Alice',
            url: 'https://aliceblog.com/segundo',
            title: 'Segundo blog de Alice',
            likes: 2,
            year: 2022,
            userId: users[0].id
        }
    ]

    for (const b of blogsData) {
        await Blog.create(b)
    }

    console.log('Datos de seed insertados correctamente.')
    await sequelize.close()
}

seed().catch(err => {
    console.error('Error en seed:', err)
    process.exit(1)
})
