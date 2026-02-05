const { Sequelize } = require('sequelize')
const { DATABASE_URL } = require('./util')

// Hacer que las opciones de SSL sean condicionales: solo cuando estamos en producción
const dialectOptions = process.env.NODE_ENV === 'production'
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  : {}

const sequelize = new Sequelize(DATABASE_URL, { dialectOptions });

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('connected to the database')
  } catch (err) {
    console.log('failed to connect to the database')
    return process.exit(1)
  }

  return null
}

module.exports = { connectToDatabase, sequelize }