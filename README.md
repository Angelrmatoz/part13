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

## Migraciones ✅

- Para aplicar las migraciones: `npm run migrate` (desde la carpeta `backend`).
- Para revertir la última migración: `node migrate.js down`.

Endpoints relacionados con la lista de lectura (parte 13.20):

- POST `/api/readinglists` — añadir un blog a la lista de lectura (body: `{ "userId": <id>, "blogId": <id> }`). Devuelve 201 y la fila creada, o 400 si ya existe.
- GET `/api/users/:id` — además de los datos del usuario, devuelve `readings` con la lista de blogs añadidos a su lista de lectura.
  - Puede filtrar por `read` usando querystring: `?read=true` o `?read=false`.
- PUT `/api/readinglists/:id` — marcar un elemento de la lista de lectura como leído o no (body: `{ "read": true }`). El usuario debe ser el propietario (token requerido).
- POST `/api/login` — al iniciar sesión se crea una sesión en la base de datos y se emite un token (contiene un identificador `jti`).
- DELETE `/api/logout` — cierra la sesión actual (requiere token). Después de cerrar sesión el token ya no es válido.

Notas de seguridad:

- Se añadió una columna `disabled` en la tabla `users` para deshabilitar inmediatamente el acceso de un usuario.
- Todas las rutas que requieren autenticación validan además la existencia de la sesión (basada en `jti`) y que el usuario no esté deshabilitado.

⚠️ Si eliminas manualmente tablas desde la base de datos, también deberás limpiar la tabla `migrations` (o eliminar su contenido) para que las migraciones pendientes se vuelvan a ejecutar.

## Autor

Ángel Matos

---

Este proyecto es parte del curso [Full Stack Open](https://fullstackopen.com/).
