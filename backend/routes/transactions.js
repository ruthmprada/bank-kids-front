import express from "express";
import pool from "../src/db.js";

const router = express.Router();

// ➕ CREAR TRANSACCIÓN
router.post("/", async (req, res) => {
  const { child, amount, type, concept, familyId } = req.body;

  try {
    // 🔍 Obtener ID real de la familia
    const familyResult = await pool.query(
      "SELECT id FROM families WHERE code = $1",
      [familyId]
    );

    if (familyResult.rows.length === 0) {
      return res.status(400).json({ error: "Familia no encontrada" });
    }

    const realFamilyId = familyResult.rows[0].id;

    // 💾 Insertar transacción
    const result = await pool.query(
      `INSERT INTO transactions (child, amount, type, concept, family_id, date)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [child, amount, type, concept, realFamilyId]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("ERROR CREANDO TRANSACCIÓN:", error);
    res.status(500).json({ error: "Error creando transacción" });
  }
});

export default router;