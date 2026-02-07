const { DataTypes } = require('sequelize')
// Usar la instancia compartida centralizada
const { sequelize } = require('../config/database')

const User = sequelize.define('user', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: { msg: 'username must be a valid email' } } },
  name: { type: DataTypes.STRING, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  disabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { timestamps: true, underscored: true }) // <-- habilita created_at y updated_at en snake_case

// Exporta solo el modelo
module.exports = { User }
