"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = exports.initDb = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbName = process.env.DB_NAME;
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 3306,
    database: dbName,
    waitForConnections: true
});
const initDb = async () => {
    const connection = await promise_1.default.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 3306
    });
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.changeUser({ database: dbName });
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      area VARCHAR(100) NOT NULL,
      role VARCHAR(100) NOT NULL,
      status ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS access_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      access_type VARCHAR(100),
      status ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS computers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      serial_number VARCHAR(100) UNIQUE NOT NULL,
      model VARCHAR(100) NOT NULL,
      is_assigned BOOLEAN DEFAULT FALSE
    )
  `);
    await connection.execute(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      computer_id INT,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (computer_id) REFERENCES computers(id) ON DELETE CASCADE
    )
  `);
    console.log('Base de datos y tablas creadas');
};
exports.initDb = initDb;
const executeQuery = async (sql, values) => {
    const connection = await pool.getConnection();
    try {
        const [results, fields] = await connection.execute(sql, values);
        return { results, fields };
    }
    finally {
        connection.release();
    }
};
exports.executeQuery = executeQuery;
(0, exports.initDb)().catch(console.error);
exports.default = pool;
