const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' })

const Blog = sequelize.define('blog', {
  author: DataTypes.STRING,
  url: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: false })

// Exporta el modelo y la instancia de sequelize
module.exports = { Blog, sequelize }
