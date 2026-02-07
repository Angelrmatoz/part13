const express = require('express')
const morgan = require('morgan')
const { connectToDatabase, sequelize } = require('./config/database')
const { PORT } = require('./config/util')
const BlogRouter = require('./controllers/blog.controllers')
const UserRouter = require('./controllers/users.controllers')
const LoginRouter = require('./controllers/login.controllers')
const AuthorsRouter = require('./controllers/authors.controllers')
const ReadingListRouter = require('./controllers/readinglists.controllers')
const errorHandler = require('./middlewares/errorHandler')

const app = express()
app.use(express.json())
app.use(morgan('tiny'))

// Rutas
app.use(BlogRouter)
app.use(UserRouter)
app.use(LoginRouter)
app.use(AuthorsRouter)
app.use(ReadingListRouter)
// Middleware de manejo de errores (siempre después de las rutas)
app.use(errorHandler)

const startServer = async () => {
  await connectToDatabase()

  // Configurar asociaciones entre modelos
  const { User } = require('./models/users.models')
  const { Blog } = require('./models/blogs.models')
  const { ReadingList } = require('./models/readinglists.models')

  // Un usuario tiene muchos blogs propios; un blog pertenece a un usuario
  User.hasMany(Blog, { foreignKey: 'userId' })
  Blog.belongsTo(User, { foreignKey: 'userId' })

  // Lista de lectura: relación many-to-many entre usuarios y blogs a través de ReadingList
  User.belongsToMany(Blog, { through: ReadingList, as: 'readingList', foreignKey: 'userId', otherKey: 'blogId' })
  Blog.belongsToMany(User, { through: ReadingList, as: 'inReadingLists', foreignKey: 'blogId', otherKey: 'userId' })

  // No sincronizamos esquemas desde el código: use migraciones para aplicar cambios en la DB
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
  })
}

startServer()

