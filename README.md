# Full Stack Open - Parte 13: Blogs con PostgreSQL y Sequelize

Este repositorio contiene el backend de la Parte 13 del curso Full Stack Open, enfocado en la creación de una API REST para la gestión de blogs utilizando Node.js, Express y una base de datos relacional PostgreSQL, accedida mediante el ORM Sequelize.

## Características principales
- **API RESTful** para la gestión de blogs (listar, crear y eliminar blogs).
- **Persistencia de datos** en PostgreSQL.
- **ORM Sequelize** para la definición de modelos y operaciones sobre la base de datos.
- **Estructura modular** con separación de controladores y modelos.
- **Middleware** para logging de peticiones HTTP (Morgan) y manejo de variables de entorno (dotenv).

## Estructura del proyecto
- `/backend/models` - Definición de modelos Sequelize y conexión a la base de datos.
- `/backend/controllers` - Rutas y lógica de negocio para la API de blogs.
- `/backend/index.js` - Punto de entrada principal del servidor Express.
- `/backend/cli.js` - Script para listar blogs desde la línea de comandos.
- `commands.sql` - Comandos SQL utilizados para la creación y manipulación inicial de la base de datos.

## Requisitos
- Node.js
- PostgreSQL (local o remoto)

## Uso
1. Instala las dependencias con `npm install` en la carpeta `backend`.
2. Configura la conexión a la base de datos en un archivo `.env`.
3. Ejecuta el servidor con `nodemon index.js` o `node index.js`.
4. Accede a la API en `http://localhost:3001/api/blogs`.

## Autor
Ángel Matos

---
Este proyecto es parte del curso [Full Stack Open](https://fullstackopen.com/).
