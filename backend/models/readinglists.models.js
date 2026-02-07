const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ReadingList = sequelize.define('reading_list', {
    // explicit fields so underscored names are stored
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id', references: { model: 'users', key: 'id' } },
    blogId: { type: DataTypes.INTEGER, allowNull: false, field: 'blog_id', references: { model: 'blogs', key: 'id' } },
    read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { timestamps: true, underscored: true })

module.exports = { ReadingList }
