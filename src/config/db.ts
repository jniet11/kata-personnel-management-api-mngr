import mysql, {
  ResultSetHeader,
  RowDataPacket,
  FieldPacket,
} from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME!;

const pool = mysql.createPool({
 host: process.env.DB_HOST,
 user: process.env.DB_USER,
 password: process.env.DB_PASSWORD,
 port: Number(process.env.DB_PORT) || 3306,
 database: dbName,
 waitForConnections: true
});

export const initDb = async () => {
  const connection = await mysql.createConnection({
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

export interface QueryResult {
  results: RowDataPacket[] | ResultSetHeader;
  fields?: FieldPacket[];
}

export const executeQuery = async (
  sql: string,
  values?: any[]
): Promise<QueryResult> => {
  const connection = await pool.getConnection();
  try {
    const [results, fields] = await connection.execute<
      RowDataPacket[] | ResultSetHeader
    >(sql, values);
    return { results, fields };
  } finally {
    connection.release();
  }
};

initDb().catch(console.error);

export default pool;
