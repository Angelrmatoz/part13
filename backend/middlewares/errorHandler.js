// Middleware centralizado de manejo de errores
// Express 5 maneja errores asíncronos de forma nativa, por lo que sólo necesitamos
// definir un manejador de errores al final de la cadena de middlewares.

/* eslint-disable no-unused-vars */
module.exports = (err, req, res, next) => {
  // Log básico del error (no exponer detalles sensibles al cliente)
  console.error(err)

  // Manejar errores de validación/constraint de Sequelize devolviendo array de mensajes
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    let messages = []
    if (err.errors && err.errors.length > 0) {
      messages = err.errors.map(e => e.message)
    } else if (err.parent && err.parent.detail) {
      // Use detail from Postgres error when available
      messages = [err.parent.detail]
    } else if (err.message) {
      messages = [err.message]
    } else {
      messages = ['Validation error']
    }
    return res.status(400).json({ error: messages })
  }

  // Errores de base de datos genéricos
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({ error: [err.message] })
  }

  // Si el controlador define un status específico (p. ej. 404 o 400)
  if (err.status) {
    return res.status(err.status).json({ error: err.message })
  }

  // Fallback general
  return res.status(500).json({ error: 'Error interno del servidor' })
}
