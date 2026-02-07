module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add 'disabled' column to users
        await queryInterface.addColumn('users', 'disabled', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false })

        // Create sessions table
        await queryInterface.createTable('sessions', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            jti: { type: Sequelize.STRING, allowNull: false, unique: true },
            user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            expires_at: { type: Sequelize.DATE, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
        })
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('sessions')
        await queryInterface.removeColumn('users', 'disabled')
    }
}
