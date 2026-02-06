const path = require('path')
const fs = require('fs')
const { sequelize, connectToDatabase } = require('./config/database')
const { Sequelize } = require('sequelize')
const { DATABASE_URL, DATABASE_NAME } = require('./config/util')
const { URL } = require('url')

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

// Ensure the target database exists: try connecting; if missing, connect to 'postgres' DB and create it
const ensureDatabaseExists = async () => {
    if (!DATABASE_NAME) return

    // Try a direct connection to the target DB
    try {
        const testSequelize = new Sequelize(DATABASE_URL, { logging: false, dialectOptions: process.env.NODE_ENV === 'production' ? { ssl: { require: true, rejectUnauthorized: false } } : {} })
        await testSequelize.authenticate()
        await testSequelize.close()
        return
    } catch (err) {
        const isDbMissing = (err && err.original && err.original.code === '3D000') || (err && err.message && err.message.includes('does not exist'))
        if (!isDbMissing) {
            console.error('Error conectando a la base de datos:', err)
            throw err
        }

        console.log(`Base de datos "${DATABASE_NAME}" no encontrada. Intentando crearla...`)
        const parsed = new URL(DATABASE_URL)
        parsed.pathname = '/postgres'
        const dialectOptions = process.env.NODE_ENV === 'production' ? { ssl: { require: true, rejectUnauthorized: false } } : {}
        const adminSequelize = new Sequelize(parsed.toString(), { dialectOptions, logging: false })
        try {
            await adminSequelize.query(`CREATE DATABASE "${DATABASE_NAME}";`)
            console.log(`Base de datos "${DATABASE_NAME}" creada.`)
        } catch (createErr) {
            // 42P04 is "duplicate_database" in Postgres
            if (createErr && createErr.original && createErr.original.code === '42P04') {
                console.log(`Base de datos "${DATABASE_NAME}" ya existe.`)
            } else {
                console.error('Error creando la base de datos:', createErr)
                throw createErr
            }
        } finally {
            await adminSequelize.close()
        }
    }
}

const runUp = async () => {
    await ensureDatabaseExists()
    await connectToDatabase()
    const queryInterface = sequelize.getQueryInterface()

    // Ensure migrations table exists
    try {
        await queryInterface.describeTable('migrations')
    } catch (err) {
        console.log('Creando tabla migrations...')
        await queryInterface.createTable('migrations', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: Sequelize.STRING, allowNull: false, unique: true },
            run_at: { type: Sequelize.DATE, allowNull: false }
        })
    }

    // Get applied migrations
    const [appliedRows] = await sequelize.query('SELECT name FROM migrations ORDER BY id')
    const applied = appliedRows.map(r => r.name)

    // Read migration files
    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.js'))
        .sort()

    for (const file of files) {
        if (applied.includes(file)) {
            console.log(`skipping already applied: ${file}`)
            continue
        }

        console.log(`Aplicando migración: ${file}`)
        const migration = require(path.join(MIGRATIONS_DIR, file))
        if (typeof migration.up !== 'function') {
            console.warn(`La migración ${file} no exporta 'up' — se omite`)
            continue
        }

        try {
            await migration.up(queryInterface, Sequelize)
            await sequelize.query('INSERT INTO migrations (name, run_at) VALUES (:name, NOW())', { replacements: { name: file } })
            console.log(`Migración aplicada: ${file}`)
        } catch (err) {
            console.error(`Error aplicando migración ${file}:`, err)
            process.exit(1)
        }
    }

    console.log('Todas las migraciones pendientes han sido aplicadas.')
    process.exit(0)
}

const runDown = async () => {
    await ensureDatabaseExists()
    await connectToDatabase()
    const queryInterface = sequelize.getQueryInterface()

    // Find last applied migration
    const [rows] = await sequelize.query('SELECT id, name FROM migrations ORDER BY id DESC LIMIT 1')
    if (!rows || rows.length === 0) {
        console.log('No hay migraciones aplicadas para revertir.')
        return process.exit(0)
    }

    const { id, name } = rows[0]
    const migrationPath = path.join(MIGRATIONS_DIR, name)
    if (!fs.existsSync(migrationPath)) {
        console.error(`Archivo de migración no encontrado: ${migrationPath}`)
        process.exit(1)
    }

    const migration = require(migrationPath)
    if (typeof migration.down !== 'function') {
        console.error(`La migración ${name} no exporta 'down'; no se puede revertir`)
        process.exit(1)
    }

    try {
        await migration.down(queryInterface, Sequelize)
        await sequelize.query('DELETE FROM migrations WHERE id = :id', { replacements: { id } })
        console.log(`Migración revertida: ${name}`)
    } catch (err) {
        console.error(`Error revirtiendo migración ${name}:`, err)
        process.exit(1)
    }

    process.exit(0)
}

const main = async () => {
    const cmd = process.argv[2] || 'up'
    if (cmd === 'up') return runUp()
    if (cmd === 'down') return runDown()

    console.error('Uso: node migrate.js [up|down]')
    process.exit(1)
}

main()
