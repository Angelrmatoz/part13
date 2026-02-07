module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('reading_lists', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            blog_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'blogs', key: 'id' }, onDelete: 'CASCADE' },
            read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
        })

        // Composite unique index to avoid duplicates
        await queryInterface.addConstraint('reading_lists', {
            fields: ['user_id', 'blog_id'],
            type: 'unique',
            name: 'reading_lists_user_blog_unique'
        })
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint('reading_lists', 'reading_lists_user_blog_unique')
        await queryInterface.dropTable('reading_lists')
    }
}
