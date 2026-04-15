console.log("🔥 ESTE AUTH SE ESTA USANDO");
import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

/// REGISTER
router.post("/register", async (req, res) => {
  console.log("🔥🔥 REGISTER HIT 🔥🔥");
  console.log("📦 BODY:", req.body);

  const { username, password, role, familyId } = req.body;

  // Validaciones
  if (!username || !password || !role) {
    console.log("❌ Faltan campos");
    return res.status(400).json({ error: "Campos obligatorios faltantes" });
  }

  if (!["parent", "child"].includes(role)) {
    console.log("❌ Rol inválido:", role);
    return res.status(400).json({ error: "Rol inválido" });
  }

  if (password.length < 6) {
    console.log("❌ Password corto");
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    console.log("🔍 Buscando usuario existente...");
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.log("❌ Usuario ya existe");
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    console.log("🔐 Hasheando contraseña...");
    const hashedPassword = await bcrypt.hash(password, 10);

    let family;

    if (role === "parent") {
      console.log("👨‍👩‍👧 Creando familia nueva");

      let code;
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        console.log(`🔁 Intento ${attempts + 1} código: ${code}`);

        const check = await pool.query(
          "SELECT id FROM families WHERE code = $1",
          [code]
        );

        if (check.rows.length === 0) {
          isUnique = true;
        }

        attempts++;
      }

      if (!isUnique) {
        console.log("❌ No se pudo generar código");
        return res.status(500).json({ error: "No se pudo generar código familiar" });
      }

      console.log("💾 Insertando familia...");
      const familyResult = await pool.query(
        "INSERT INTO families (code) VALUES ($1) RETURNING id, code",
        [code]
      );

      console.log("📊 RESULT family:", familyResult.rows);

      if (!familyResult.rows[0]) {
        console.log("❌ Error creando familia");
        return res.status(500).json({ error: "Error al crear familia" });
      }

      family = familyResult.rows[0];
      console.log("✅ Familia creada:", family);

    } else {
      if (!familyId) {
        console.log("❌ Falta código familiar");
        return res.status(400).json({ error: "Código familiar requerido para hijos" });
      }

      console.log("🔍 Buscando familia con code:", familyId);

      const familyResult = await pool.query(
        "SELECT * FROM families WHERE code = $1",
        [familyId]
      );

      console.log("📊 RESULT family búsqueda:", familyResult.rows);

      if (familyResult.rows.length === 0) {
        console.log("❌ Código inválido");
        return res.status(400).json({ error: "Código familiar inválido" });
      }

      family = familyResult.rows[0];
      console.log("✅ Familia encontrada:", family);
    }

    console.log("👤 Insertando usuario con family_id:", family.id);

    const userResult = await pool.query(
      "INSERT INTO users (username, password, role, family_id) VALUES ($1, $2, $3, $4) RETURNING id",
      [username, hashedPassword, role, family.id]
    );

    console.log("✅ Usuario creado:", userResult.rows);

    const response = {
      message: "Usuario creado",
      familyCode: family.code
    };

    console.log("📤 RESPONSE:", response);

    res.json(response);

  } catch (error) {
    console.log("💥💥 ERROR REAL 💥💥");
    console.log(error); // 👈 ESTO ES CLAVE

    console.error("[REGISTER ERROR]", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });

    res.status(500).json({ 
      error: "Error al registrar", 
      details: error.message 
    });
  }
});


/// LOGIN (igual que tenías)
router.post("/login", async (req, res) => {
  console.log("📦 BODY LOGIN:", req.body);
  const { username, password } = req.body;

  console.log("👉 USERNAME RECIBIDO:", username);

  try {
    const result = await pool.query(
  `SELECT id, username, role, family_id, password
   FROM users 
   WHERE LOWER(username) = LOWER($1)`,
  [username.trim()]
);

    console.log("👉 RESULT DB:", result.rows);

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // 🔍 Obtener el code de la familia
const familyResult = await pool.query(
  "SELECT code FROM families WHERE id = $1",
  [user.family_id]
);

const familyCode = familyResult.rows[0]?.code;

res.json({
  message: "Login correcto",
  user: {
    username: user.username,
    role: user.role,
    familyId: familyCode // 👈 AHORA TODO CUADRA
  }
});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en login" });
  }
});

export default router;