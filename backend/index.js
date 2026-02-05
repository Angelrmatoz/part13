const express = require('express')
const morgan = require('morgan')
const { connectToDatabase, sequelize } = require('./config/database')
const { PORT } = require('./config/util')
const BlogRouter = require('./controllers/blog.controllers')
const UserRouter = require('./controllers/users.controllers')
const LoginRouter = require('./controllers/login.controllers')
const AuthorsRouter = require('./controllers/authors.controllers')
const errorHandler = require('./middlewares/errorHandler')

const app = express()
app.use(express.json())
app.use(morgan('tiny'))

// Rutas
app.use(BlogRouter)
app.use(UserRouter)
app.use(LoginRouter)
app.use(AuthorsRouter)
// Middleware de manejo de errores (siempre después de las rutas)
app.use(errorHandler)

const startServer = async () => {
  await connectToDatabase()

  // Configurar asociaciones entre modelos
  const { User } = require('./models/users.models')
  const { Blog } = require('./models/blogs.models')
  User.hasMany(Blog, { foreignKey: 'userId' })
  Blog.belongsTo(User, { foreignKey: 'userId' })

  if (process.env.NODE_ENV === 'production') {
    await sequelize.sync()
  } else {
    // En desarrollo aplicar alter para sincronizar columnas nuevas sin perder datos
    await sequelize.sync({ alter: true })
  }
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
  })
}

startServer()
