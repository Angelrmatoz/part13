module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Añadir columna 'year' permitiendo nulls para no romper datos existentes
        await queryInterface.addColumn('blogs', 'year', { type: Sequelize.INTEGER, allowNull: true })

        // Añadir constraint CHECK para que el valor esté entre 1991 y el año actual
        await queryInterface.sequelize.query(
            `ALTER TABLE "blogs" ADD CONSTRAINT blogs_year_check CHECK (year >= 1991 AND year <= EXTRACT(YEAR FROM CURRENT_DATE))`
        )
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`ALTER TABLE "blogs" DROP CONSTRAINT IF EXISTS blogs_year_check`)
        await queryInterface.removeColumn('blogs', 'year')
    }
}
