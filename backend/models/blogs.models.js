const { DataTypes } = require('sequelize')
// Usar la instancia compartida centralizada
const { sequelize } = require('../config/database')

const Blog = sequelize.define('blog', {
  author: DataTypes.STRING,
  url: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id', references: { model: 'users', key: 'id' } }
}, { timestamps: false, underscored: true })

// Asociaciones definidas en un punto central (index.js) o aquí si user model ya cargado
// Para evitar ciclos, sólo exportamos el modelo; las asociaciones se configurarán en index.js

module.exports = { Blog }
