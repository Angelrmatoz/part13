require('dotenv').config()
const { Blog, sequelize } = require('./models/blogs.models')

const main = async () => {
  try {
    await sequelize.authenticate()
    const blogs = await Blog.findAll()
    blogs.forEach(blog => {
      console.log(`${blog.author}: '${blog.title}', ${blog.likes} likes`)
    })
    await sequelize.close()
  } catch (error) {
    console.error('Error al consultar los blogs:', error)
  }
}

main()
