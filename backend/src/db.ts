/**
 * ============================================
 * CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS
 * ============================================
 * Este archivo configura y exporta un pool de conexiones
 * a la base de datos PostgreSQL.
 *
 * El "Pool" permite múltiples conexiones simultáneas
 * para que varios usuarios puedan acceder a la BD al mismo tiempo
 * sin que una solicitud bloquee a otra.
 */

/**
 * IMPORTACIÓN DE LIBRERÍA
 * ──────────────────────
 * "pg" es la librería de PostgreSQL para Node.ts
 * - import pkg from "pg": importa todo el módulo
 * - const { Pool } = pkg: extrae la clase Pool
 * 
 * Pool es la herramienta para gestionar conexiones a la BD
 */

/**
 * ============================================
 * CREAR EL POOL DE CONEXIONES
 * ============================================
 * Configuración de conexión a PostgreSQL
 * 
 * Parámetros:
 *   - user: usuario de PostgreSQL (por defecto suele ser "postgres")
 *   - host: dirección del servidor BD ("localhost" = esta máquina)
 *   - database: nombre de la BD que queremos usar (en este caso "family_app")
 *   - password: contraseña para acceder a PostgreSQL (1234)
 *   - port: puerto donde escucha PostgreSQL (5433 es no-estándar, por defecto es 5432)
 * 
 * ⚠️ IMPORTANTE PARA PRODUCCIÓN:
 *   - Nunca guardes credenciales en el código
 *   - Usa variables de entorno: process.env.DB_PASSWORD
 *   - Crea un archivo .env con: DB_PASSWORD=1234
 *   - Ignora .env en .gitignore para no compartir contraseñas
 */
import { Pool } from "pg";

const db = new Pool({
  user: "postgres",
  host: "localhost",
  database: "family_app",
  password: "1234",
  port: 5433,
});

/**
 * ============================================
 * EXPORTAR EL POOL
 * ============================================
 * Se exporta como default para que otros archivos lo importen así:
 * 
 *   import db from "../db";
 * 
 * Este pool se usa en:
 *   - backend/routes/auth.ts: para registros y logins (INSERT, SELECT)
 *   - backend/routes/dashboard.ts: para obtener datos de familia e hijos
 * 
 * Ejemplo de uso:
 * 
 *   const result = await pool.query(
 *     "SELECT * FROM users WHERE id = $1",
 *     [userId]
 *   );
 * 
 * - pool.query(): ejecuta una consulta SQL
 * - "SELECT..." : SQL a ejecutar
 * - [userId] : parámetros para evitar SQL injection
 * - await: espera a que termine la consulta
 * - result.rows : accede a los resultados
 */
export default db;