module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Crear tabla users
        await queryInterface.createTable('users', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            username: { type: Sequelize.STRING, allowNull: false, unique: true },
            name: { type: Sequelize.STRING, allowNull: false },
            password_hash: { type: Sequelize.STRING, allowNull: false },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
        })

        // Crear tabla blogs
        await queryInterface.createTable('blogs', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            author: { type: Sequelize.STRING },
            url: { type: Sequelize.STRING, allowNull: false },
            title: { type: Sequelize.STRING, allowNull: false },
            likes: { type: Sequelize.INTEGER, defaultValue: 0 },
            user_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('blogs')
        await queryInterface.dropTable('users')
    }
}
