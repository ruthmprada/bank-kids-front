console.log("🔥 ESTE AUTH SE ESTA USANDO");

/**
 * ============================================
 * IMPORTACIONES Y CONFIGURACIÓN
 * ============================================
 * - express: framework web para Node.js
 * - pool: conexión a la base de datos PostgreSQL
 * - bcrypt: librería para encriptar contraseñas de forma segura
 */
import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";

// Crear un enrutador de Express para gestionar rutas de autenticación
const router = express.Router();

/**
 * ============================================
 * ENDPOINT: POST /register
 * ============================================
 * Permite crear un nuevo usuario (padre o hijo)
 * 
 * Recibe:
 *   - username: nombre de usuario único
 *   - password: contraseña (será encriptada)
 *   - role: "parent" o "child"
 *   - familyId: (opcional) código de familia existente
 *
 * Retorna:
 *   - message: confirmación
 *   - familyCode: código para compartir con otros padres
 */
router.post("/register", async (req, res) => {
  console.log("🔥🔥 REGISTER HIT 🔥🔥");
  console.log("📦 BODY:", req.body);

  let { username, password, role, familyId } = req.body;

  /**
   * PASO 1: NORMALIZACIÓN DE DATOS
   * ─────────────────────────────
   * - Limpia espacios en blanco del username
   * - Convierte familyId a mayúsculas para consistencia
   * - Esto evita problemas por espacios extras o mayúsculas/minúsculas
   */
  username = username?.trim();
  familyId = familyId?.trim().toUpperCase();

  /**
   * PASO 2: VALIDACIONES INICIALES
   * ──────────────────────────────
   * Verifica que los campos obligatorios lleguen
   */
  if (!username || !password || !role) {
    console.log("❌ Faltan campos");
    return res.status(400).json({ error: "Campos obligatorios faltantes" });
  }

  /**
   * Valida que el rol sea solo "parent" o "child"
   * Rechaza cualquier otro valor
   */
  if (!["parent", "child"].includes(role)) {
    console.log("❌ Rol inválido:", role);
    return res.status(400).json({ error: "Rol inválido" });
  }

  /**
   * Requiere contraseña con mínimo 6 caracteres
   * Por seguridad, no debe ser muy corta
   */
  if (password.length < 6) {
    console.log("❌ Password corto");
    return res.status(400).json({
      error: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  try {
    /**
     * PASO 3: VERIFICAR QUE EL USUARIO NO EXISTA
     * ──────────────────────────────────────────
     * Busca en la BD si ya existe un usuario con ese username
     * La búsqueda es CASE-INSENSITIVE (minúsculas y mayúsculas)
     * para evitar duplicados como "juan" y "JUAN"
     */
    console.log("🔍 Buscando usuario existente...");
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER($1)",
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.log("❌ Usuario ya existe");
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    /**
     * PASO 4: ENCRIPTAR LA CONTRASEÑA
     * ───────────────────────────────
     * Usa bcrypt para hashear la contraseña
     * - Parámetro 10: nivel de salting (más seguro, más lento)
     * - Nunca se guarda la contraseña en texto plano
     * - Solo se puede verificar, no recuperar
     */
    console.log("🔐 Hasheando contraseña...");
    const hashedPassword = await bcrypt.hash(password, 10);

    /**
     * PASO 5: GESTIÓN DE LA FAMILIA
     * ────────────────────────────
     * Diferencia el flujo entre PADRES e HIJOS
     */
    let family;

    // LÓGICA DE PADRES
    if (role === "parent") {
      if (familyId) {
        /**
         * CASO A: PADRE UNIÉNDOSE A FAMILIA EXISTENTE
         * ──────────────────────────────────────────
         * Si el padre proporciona un código:
         * - Busca esa familia en la BD
         * - Usa el mismo family_id que otros padres
         * - Permite que múltiples padres compartan acceso a los mismos hijos
         */
        console.log("🔗 Padre uniéndose a familia:", familyId);

        const familyResult = await pool.query(
          "SELECT * FROM families WHERE code = $1",
          [familyId]
        );

        if (familyResult.rows.length === 0) {
          console.log("❌ Código inválido");
          return res
            .status(400)
            .json({ error: "Código familiar inválido" });
        }

        family = familyResult.rows[0];
      } else {
        /**
         * CASO B: PADRE CREANDO NUEVA FAMILIA
         * ──────────────────────────────────
         * Si NO proporciona código:
         * - Genera un código aleatorio único (6 caracteres)
         * - Inserta una nueva familia en la BD
         * - Este código será compartido para que otros padres se unan
         */
        console.log("👨 Creando nueva familia");

        let code;
        let isUnique = false;
        let attempts = 0;

        /**
         * Loop para generar código aleatorio único
         * - Genera string aleatorio: Math.random().toString(36) da base-36
         * - .substring(2, 8): obtiene 6 caracteres
         * - .toUpperCase(): convierte a mayúsculas (ABC123)
         * - Intenta máximo 10 veces (por seguridad, evita loop infinito)
         */
        while (!isUnique && attempts < 10) {
          code = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

          const check = await pool.query(
            "SELECT id FROM families WHERE code = $1",
            [code]
          );

          if (check.rows.length === 0) {
            isUnique = true; // Código no existe, es único ✓
          }

          attempts++;
        }

        // Si no pudo generar código único en 10 intentos, error
        if (!isUnique) {
          return res.status(500).json({
            error: "No se pudo generar código familiar",
          });
        }

        /**
         * Inserta la nueva familia en la tabla "families"
         * RETURNING: retorna el id y code generado de la familia
         */
        const familyResult = await pool.query(
          "INSERT INTO families (code) VALUES ($1) RETURNING id, code",
          [code]
        );

        family = familyResult.rows[0];
        console.log("✅ Familia creada:", family);
      }
    }

    // LÓGICA DE HIJOS
    else {
      /**
       * HIJOS: REQUIEREN CÓDIGO FAMILIAR OBLIGATORIO
       * ─────────────────────────────────────────
       * Un hijo NO puede crear familia nueva
       * Debe proporcionar un código de una familia existente
       * para vincularse a esa familia
       */
      if (!familyId) {
        console.log("❌ Falta código familiar");
        return res.status(400).json({
          error: "Código familiar requerido para hijos",
        });
      }

      /**
       * Busca la familia con el código proporcionado
       */
      const familyResult = await pool.query(
        "SELECT * FROM families WHERE code = $1",
        [familyId]
      );

      if (familyResult.rows.length === 0) {
        console.log("❌ Código inválido");
        return res
          .status(400)
          .json({ error: "Código familiar inválido" });
      }

      family = familyResult.rows[0];
    }

    /**
     * PASO 6: INSERTAR USUARIO EN LA BASE DE DATOS
     * ────────────────────────────────────────────
     * Crea el registro con:
     * - username: único y ya verificado
     * - password: hasheada por seguridad
     * - role: "parent" o "child"
     * - family_id: ya determinado (nueva o existente)
     * 
     * El RETURNING... devuelve el id del usuario creado
     */
    console.log("👤 Insertando usuario con family_id:", family.id);

    const userResult = await pool.query(
      "INSERT INTO users (username, password, role, family_id) VALUES ($1, $2, $3, $4) RETURNING id",
      [username, hashedPassword, role, family.id]
    );

    console.log("✅ Usuario creado:", userResult.rows);

    /**
     * PASO 7: RESPUESTA AL CLIENTE
     * ───────────────────────────
     * Retorna el código familiar para que el usuario lo guarde
     * Este código será usado por otros padres para unirse
     */
    res.json({
      message: "Usuario creado",
      familyCode: family.code,
    });
  } catch (error) {
    /**
     * MANEJO DE ERRORES
     * ────────────────
     * Si algo falla (conexión BD, datos inválidos, etc):
     * - Log del error para debugging
     * - Respuesta 500 (error interno del servidor)
     * - Detalles del error para el cliente
     */
    console.log("💥 ERROR REGISTER:", error);

    res.status(500).json({
      error: "Error al registrar",
      details: error.message,
    });
  }
});


/**
 * ============================================
 * ENDPOINT: POST /login
 * ============================================
 * Permite a un usuario (padre o hijo) iniciar sesión
 * 
 * Recibe:
 *   - username: nombre de usuario registrado
 *   - password: contraseña en texto plano (será verificada)
 *
 * Retorna:
 *   - message: confirmación de login exitoso
 *   - user: objeto con username, role, familyId (código)
 */
router.post("/login", async (req, res) => {
  console.log("📦 BODY LOGIN:", req.body);

  let { username, password } = req.body;

  /**
   * PASO 1: NORMALIZACIÓN
   * ───────────────────
   * Limpia espacios en blanco del username
   * para evitar problemas por espacios extras
   */
  username = username?.trim();

  console.log("👉 USERNAME RECIBIDO:", username);

  try {
    /**
     * PASO 2: BUSCAR EL USUARIO EN LA BASE DE DATOS
     * ─────────────────────────────────────────────
     * Busca un usuario que coincida con el username
     * La búsqueda es CASE-INSENSITIVE (LOWER)
     * Retorna: id, username, role, family_id, password (hasheada)
     */
    const result = await pool.query(
      `SELECT id, username, role, family_id, password
       FROM users 
       WHERE LOWER(username) = LOWER($1)`,
      [username]
    );

    console.log("👉 RESULT DB:", result.rows);

    const user = result.rows[0];

    /**
     * Si no existe el usuario en la BD, rechaza el login
     */
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    /**
     * PASO 3: VERIFICAR LA CONTRASEÑA
     * ───────────────────────────────
     * Usa bcrypt.compare() para verificar la contraseña
     * - Primer parámetro: contraseña en texto plano (del formulario)
     * - Segundo parámetro: contraseña hasheada (de la BD)
     * 
     * bcrypt es unidireccional:
     * - La contraseña del usuario se "hashea" y se compara con el hash en BD
     * - No necesita desencriptar (eso sería inseguro)
     * 
     * Retorna true si coincide, false si no
     */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    /**
     * PASO 4: OBTENER EL CÓDIGO DE FAMILIA
     * ────────────────────────────────────
     * El usuario tiene family_id en BD
     * Ahora buscamos el código (code) de esa familia
     * Este código es lo que se muestra al usuario y se usa en el frontend
     */
    const familyResult = await pool.query(
      "SELECT code FROM families WHERE id = $1",
      [user.family_id]
    );

    const familyCode = familyResult.rows[0]?.code;

    /**
     * PASO 5: RESPUESTA EXITOSA
     * ────────────────────────
     * Retorna los datos del usuario logueado
     * El frontend guardará esta información en localStorage
     * para mantener la sesión activa
     */
    res.json({
      message: "Login correcto",
      user: {
        username: user.username,
        role: user.role,
        familyId: familyCode,
      },
    });
  } catch (error) {
    /**
     * MANEJO DE ERRORES
     * ────────────────
     * Error por problemas con la BD o datos inválidos
     */
    console.error("💥 ERROR LOGIN:", error);
    res.status(500).json({ error: "Error en login" });
  }
});

/**
 * ============================================
 * EXPORTAR EL ROUTER
 * ============================================
 * Este router se importa en server.js
 * y se usa como: app.use("/api/auth", router)
 * 
 * Esto hace que los endpoints estén disponibles en:
 * - POST /api/auth/register
 * - POST /api/auth/login
 */
export default router;