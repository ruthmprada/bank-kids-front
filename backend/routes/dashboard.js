/**
 * ============================================
 * IMPORTACIONES Y CONFIGURACIÓN
 * ============================================
 * - express: framework web para Node.js
 * - pool: conexión a la base de datos PostgreSQL
 */
import express from "express";
import pool from "../db.js";

// Crear un enrutador de Express para gestionar rutas del dashboard
const router = express.Router();

/**
 * ============================================
 * ENDPOINT: GET /:familyCode
 * ============================================
 * Obtiene datos del dashboard de una familia
 * como ahorros totales, progreso de metas, etc
 * 
 * Recibe (como parámetro de ruta):
 *   - familyCode: código único de la familia (ej: ABC123)
 *
 * Retorna:
 *   - currentSavings: monto total ahorrado por la familia
 *   - goalProgress: progreso actual hacia la meta
 *   - goalTarget: objetivo/meta de ahorro establecido
 * 
 * Accesible en: GET /api/dashboard/ABC123
 */
router.get("/:familyCode", async (req, res) => {
  const { familyCode } = req.params;

  try {
    /**
     * PASO 1: VALIDAR QUE LA FAMILIA EXISTA
     * ────────────────────────────────────
     * Busca la familia usando el código proporcionado
     * Si no existe, retorna error 404
     */
    const familyResult = await pool.query(
      "SELECT * FROM families WHERE code = $1",
      [familyCode]
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    const family = familyResult.rows[0];

    /**
     * PASO 2: OBTENER DATOS DE AHORROS DE LA FAMILIA
     * ──────────────────────────────────────────────
     * Busca el registro de ahorros de esta familia en la tabla "savings"
     * La tabla savings contiene:
     *   - amount: dinero total ahorrado
     *   - goal_target: meta u objetivo establecido
     *   - family_id: relación con la familia
     */
    const savingsResult = await pool.query(
      "SELECT * FROM savings WHERE family_id = $1",
      [family.id]
    );

    const data = savingsResult.rows[0];

    /**
     * PASO 3: VALORES POR DEFECTO
     * ──────────────────────────
     * Si no hay registro de ahorros (nueva familia):
     * - Retorna valores iniciales: 0 ahorros, meta de 200
     * - Esto evita que la app se rompa si no existen los datos
     */
    if (!data) {
      return res.json({
        currentSavings: 0,
        goalProgress: 0,
        goalTarget: 200
      });
    }

    /**
     * PASO 4: RESPUESTA CON DATOS DE AHORROS
     * ──────────────────────────────────────
     * Retorna:
     * - currentSavings: monto total en la cuenta familiar
     * - goalProgress: progreso (en este caso, igual al monto actual)
     * - goalTarget: meta que se quiere alcanzar
     * 
     * Se convierte a Number() porque PostgreSQL devuelve strings
     * para tipos numéricos como DECIMAL
     */
    res.json({
      currentSavings: Number(data.amount),
      goalProgress: Number(data.amount),
      goalTarget: Number(data.goal_target)
    });

  } catch (error) {
    /**
     * MANEJO DE ERRORES
     * ────────────────
     * Si algo falla en la consulta a BD
     */
    console.error(error);
    res.status(500).json({ error: "Error cargando dashboard" });
  }
});

/**
 * ============================================
 * ENDPOINT: GET /children/:familyCode
 * ============================================
 * Obtiene la lista de HIJOS vinculados a una familia
 * Los padres usan este endpoint para ver quiénes son sus hijos
 * 
 * Recibe (como parámetro de ruta):
 *   - familyCode: código único de la familia (ej: ABC123)
 *
 * Retorna:
 *   - Array de objetos con datos de cada hijo:
 *     * username: nombre de usuario del hijo
 *     * role: siempre será "child"
 *     * family_code: código de la familia
 * 
 * Accesible en: GET /api/dashboard/children/ABC123
 * 
 * Nota: Lee el archivo DashboardParent.tsx para ver cómo se usa
 *       El endpoint se consume en: loadUsers() de useEffect
 */
router.get("/children/:familyCode", async (req, res) => {
  const { familyCode } = req.params;

  try {
    /**
     * PASO 1: VALIDAR QUE LA FAMILIA EXISTA
     * ────────────────────────────────────
     * Busca la familia usando el código proporcionado
     * Obtiene el id de la familia (necesario para la siguiente consulta)
     */
    const familyResult = await pool.query(
      "SELECT id FROM families WHERE code = $1",
      [familyCode]
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    const familyId = familyResult.rows[0].id;

    /**
     * PASO 2: OBTENER TODOS LOS HIJOS DE LA FAMILIA
     * ──────────────────────────────────────────────
     * Usa un JOIN (unión) entre dos tablas:
     * - users: contiene username, role, family_id
     * - families: contiene el código (code) de la familia
     * 
     * WHERE condiciones:
     *   - users.family_id = $1: solo usuarios de esta familia
     *   - users.role = 'child': solo filtra hijos, no padres
     * 
     * Resultado: lista de todos los hijos del family_id especificado
     */
    const usersResult = await pool.query(
      `SELECT users.username, users.role, families.code as family_code
       FROM users
       JOIN families ON users.family_id = families.id
       WHERE users.family_id = $1 AND users.role = 'child'`,
      [familyId]
    );

    /**
     * PASO 3: RESPUESTA
     * ────────────────
     * Retorna array de hijos
     * Si no hay hijos, retorna array vacío []
     * 
     * El frontend (DashboardParent.tsx) mapea este array
     * para mostrar cada hijo con su balance y metas
     */
    res.json(usersResult.rows);

  } catch (error) {
    /**
     * MANEJO DE ERRORES
     * ────────────────
     * Si falla la consulta a BD o hay un error interno
     */
    console.error("ERROR GET CHILDREN:", error);
    res.status(500).json({ error: "Error obteniendo hijos" });
  }
});

/**
 * ============================================
 * EXPORTAR EL ROUTER
 * ============================================
 * Este router se importa en server.js
 * y se usa como: app.use("/api/dashboard", router)
 * 
 * Esto hace que los endpoints estén disponibles en:
 * - GET /api/dashboard/ABC123
 * - GET /api/dashboard/children/ABC123
 */
export default router;