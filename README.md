# Personnel Management API

Esta es una API RESTful construida con Node.js, Express y TypeScript para gestionar personal, solicitudes de acceso y asignaciones de equipos de cómputo. Utiliza MySQL como base de datos.

## Descripción del Funcionamiento

La API permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para las siguientes entidades:

*   **Usuarios (Users):** Permite registrar nuevos colaboradores, obtener la lista de todos los colaboradores, actualizar su información (nombre, email, área, rol, estado) y eliminarlos.
*   **Solicitudes de Acceso (Access Requests):** Permite crear solicitudes de acceso para los usuarios, ver todas las solicitudes, obtener una solicitud específica por ID, actualizarla (cambiar usuario, tipo de acceso, estado) y eliminarla.
*   **Asignaciones de Equipos (Assignments):** Permite asignar equipos de cómputo a los usuarios, ver todas las asignaciones, obtener una asignación específica, actualizarla (cambiar usuario, equipo, fecha de asignación, estado) y eliminarla. Al crear o actualizar una asignación, también se actualiza el estado de disponibilidad del equipo de cómputo.

La API utiliza un sistema de conexión a base de datos con pooling y maneja transacciones para operaciones críticas que involucran múltiples tablas (como la creación, actualización y eliminación de asignaciones) para asegurar la integridad de los datos.

## Tecnologías Utilizadas

*   **Node.js:** Entorno de ejecución para JavaScript del lado del servidor. (Se recomienda la última versión LTS)
*   **TypeScript:** Superset de JavaScript que añade tipado estático.
*   **Express.js:** Framework web minimalista y flexible para Node.js.
*   **MySQL2:** Cliente MySQL para Node.js, con soporte para Promesas.
*   **Dotenv:** Módulo para cargar variables de entorno desde un archivo `.env`.
*   **ts-node:** Ejecución de TypeScript directamente en Node.js (para desarrollo).
*   **Nodemon:** Herramienta que ayuda al desarrollo de aplicaciones basadas en Node.js reiniciando automáticamente la aplicación cuando detecta cambios en los archivos.

## Prerrequisitos

*   Node.js (versión 16.x o superior recomendada)
*   NPM (generalmente viene con Node.js) o Yarn
*   Un servidor MySQL en ejecución.

## Instalación

1.  Clona el repositorio:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd kata-personnel-management-api-mngr
    ```

2.  Instala las dependencias del proyecto:
    ```bash
    npm install
    ```
    o si usas Yarn:
    ```bash
    yarn install
    ```

## Configuración

1.  Crea un archivo `.env` en la raíz del proyecto (`/kata-personnel-management-api-mngr/.env`).
2.  Copia el contenido de `.env.example` (si existe) o añade las siguientes variables de entorno al archivo `.env` y configúralas con tus credenciales de base de datos MySQL:

    ```env
    DB_HOST=localhost
    DB_USER=tu_usuario_mysql
    DB_PASSWORD=tu_contraseña_mysql
    DB_PORT=3306
    DB_NAME=personnel_management_db
    PORT=3000
    ```

    Asegúrate de que la base de datos especificada en `DB_NAME` exista en tu servidor MySQL o que el script de inicialización pueda crearla.

## Cómo Correr la Aplicación en Local

1.  **Inicializar la Base de Datos y Tablas:**
    El script `src/config/db.ts` se ejecuta automáticamente al iniciar la aplicación si la base de datos o las tablas no existen. Si necesitas ejecutarlo manualmente (por ejemplo, después de borrar la base de datos):
    ```bash
    npx ts-node src/config/db.ts
    ```
    Esto creará la base de datos (si no existe) y las tablas necesarias.

2.  **Iniciar el Servidor de Desarrollo:**
    El proyecto utiliza `nodemon` y `ts-node` para el desarrollo, lo que permite que el servidor se reinicie automáticamente al detectar cambios en los archivos TypeScript.
    ```bash
    npm run dev
    ```
    Esto iniciará el servidor, generalmente en `http://localhost:3000` (o el puerto que hayas configurado en `PORT` en tu archivo `.env`).

3.  **Para producción (compilado):**
    Primero, compila el código TypeScript a JavaScript:
    ```bash
    npm run build
    ```
    Luego, inicia la aplicación desde los archivos compilados en el directorio `dist`:
    ```bash
    npm start
    ```

## API Endpoints

La API expone los siguientes endpoints principales bajo el prefijo `/api` (configurado en `src/index.ts`):

### Usuarios (`/api/users`)
*   `POST /create-user`: Crea un nuevo usuario.
*   `GET /get-users`: Obtiene todos los usuarios.
*   `PUT /update-user/:id`: Actualiza un usuario existente.
*   `DELETE /delete-user/:id`: Elimina un usuario.
*   `POST /create-update-status/:id`: Actualiza el estado de un usuario.

### Solicitudes de Acceso (`/api/access-requests`)
*   `POST /create-access-request`: Crea una nueva solicitud de acceso.
*   `GET /get-access-requests`: Obtiene todas las solicitudes de acceso.
*   `GET /get-access-request-by-id/:id`: Obtiene una solicitud de acceso por su ID.
*   `PUT /update-access-request/:id`: Actualiza una solicitud de acceso.
*   `DELETE /delete-access-request/:id`: Elimina una solicitud de acceso.

### Asignaciones de Equipos (`/api/assignments`)
*   `POST /create-assignment`: Crea una nueva asignación de equipo.
*   `GET /get-assignments`: Obtiene todas las asignaciones.
*   `GET /get-assignment-by-id/:id`: Obtiene una asignación por su ID.
*   `PUT /update-assignment/:id`: Actualiza una asignación.
*   `DELETE /delete-assignment/:id`: Elimina una asignación.

Consulta el archivo `src/routes/personnelManagementRoutes.ts` para ver la definición exacta de las rutas y los controladores asociados.