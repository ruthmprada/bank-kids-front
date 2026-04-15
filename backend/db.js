import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "family_app",
  password: "1234", // contraseña del usuario de la base de datos
  port: 5433, // puerto de conexión a la base de datos
});

export default pool;