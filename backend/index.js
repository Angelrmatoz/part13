require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const { sequelize } = require('./models/blogs.models')
// Importa el router de blogs
const BlogRouter = require('./controllers/blog.controllers')

const app = express()
app.use(express.json())
app.use(morgan('tiny'))

// Usa el router de blogs
app.use(BlogRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
    console.log('Conexión y sincronización con la base de datos exitosa.')
    console.log(`Servidor corriendo en el puerto ${PORT}`)
  } catch (error) {
    console.error('Error al conectar/sincronizar la base de datos:', error)
  }
})
