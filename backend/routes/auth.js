console.log("🔥 ESTE AUTH SE ESTA USANDO");
import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

/// REGISTER
router.post("/register", async (req, res) => {
  console.log("🔥🔥 REGISTER HIT 🔥🔥");
  console.log("📦 BODY:", req.body);

  let { username, password, role, familyId } = req.body;

  // 🔧 Normalización
  username = username?.trim();
  familyId = familyId?.trim().toUpperCase();

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
    return res.status(400).json({
      error: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  try {
    console.log("🔍 Buscando usuario existente...");
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER($1)",
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.log("❌ Usuario ya existe");
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    console.log("🔐 Hasheando contraseña...");
    const hashedPassword = await bcrypt.hash(password, 10);

    let family;

    // 👨 PADRES
    if (role === "parent") {
      if (familyId) {
        // 👉 UNIRSE A FAMILIA EXISTENTE
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
        // 👉 CREAR NUEVA FAMILIA
        console.log("👨 Creando nueva familia");

        let code;
        let isUnique = false;
        let attempts = 0;

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
            isUnique = true;
          }

          attempts++;
        }

        if (!isUnique) {
          return res.status(500).json({
            error: "No se pudo generar código familiar",
          });
        }

        const familyResult = await pool.query(
          "INSERT INTO families (code) VALUES ($1) RETURNING id, code",
          [code]
        );

        family = familyResult.rows[0];
        console.log("✅ Familia creada:", family);
      }
    }

    // 👶 HIJOS
    else {
      if (!familyId) {
        console.log("❌ Falta código familiar");
        return res.status(400).json({
          error: "Código familiar requerido para hijos",
        });
      }

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

    console.log("👤 Insertando usuario con family_id:", family.id);

    const userResult = await pool.query(
      "INSERT INTO users (username, password, role, family_id) VALUES ($1, $2, $3, $4) RETURNING id",
      [username, hashedPassword, role, family.id]
    );

    console.log("✅ Usuario creado:", userResult.rows);

    res.json({
      message: "Usuario creado",
      familyCode: family.code,
    });
  } catch (error) {
    console.log("💥 ERROR REGISTER:", error);

    res.status(500).json({
      error: "Error al registrar",
      details: error.message,
    });
  }
});


/// LOGIN
router.post("/login", async (req, res) => {
  console.log("📦 BODY LOGIN:", req.body);

  let { username, password } = req.body;

  // 🔧 Normalización
  username = username?.trim();

  console.log("👉 USERNAME RECIBIDO:", username);

  try {
    const result = await pool.query(
      `SELECT id, username, role, family_id, password
       FROM users 
       WHERE LOWER(username) = LOWER($1)`,
      [username]
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

    // 🔍 Obtener código de familia
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
        familyId: familyCode,
      },
    });
  } catch (error) {
    console.error("💥 ERROR LOGIN:", error);
    res.status(500).json({ error: "Error en login" });
  }
});

export default router;