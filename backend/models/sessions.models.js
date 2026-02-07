const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Session = sequelize.define('session', {
    jti: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id', references: { model: 'users', key: 'id' } },
    expiresAt: { type: DataTypes.DATE, allowNull: true, field: 'expires_at' }
}, { timestamps: true, underscored: true })

module.exports = { Session }
