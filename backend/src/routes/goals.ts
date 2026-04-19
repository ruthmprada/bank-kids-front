import { Router } from "express";
import db from "../db";

const router = Router();

// 🔹 GET metas por familia
router.get("/:familyCode", async (req, res) => {
  const { familyCode } = req.params;

  try {
    console.log("🔥 GET GOALS:", familyCode);

    const family = await db.query(
      "SELECT id FROM families WHERE code = $1",
      [familyCode]
    );

    if (family.rows.length === 0) {
      console.error("❌ Familia no encontrada:", familyCode);
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    const familyId = family.rows[0].id;

    const result = await db.query(
      "SELECT * FROM goals WHERE family_id = $1 ORDER BY created_at DESC",
      [familyId]
    );

    console.log("✅ Metas encontradas:", result.rows.length);
    res.json(result.rows);

  } catch (error) {
    console.error("❌ ERROR GET GOALS:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Error obteniendo metas"
    });
  }
});

// 🔹 CREAR meta
router.post("/", async (req, res) => {
  const { familyId, child, title, targetAmount } = req.body;

  try {
    console.log("🔥 POST GOAL:", { familyId, child, title, targetAmount });

    if (!familyId || !child || !title || !targetAmount) {
      return res.status(400).json({
        error: "Faltan campos obligatorios"
      });
    }

    const family = await db.query(
      "SELECT id FROM families WHERE code = $1",
      [familyId]
    );

    if (family.rows.length === 0) {
      console.error("❌ Familia no encontrada:", familyId);
      return res.status(400).json({ error: "Familia no encontrada" });
    }

    const realFamilyId = family.rows[0].id;

    const result = await db.query(
      `INSERT INTO goals (family_id, child, title, target_amount, created_at)
       VALUES ($1,$2,$3,$4,NOW())
       RETURNING *`,
      [realFamilyId, child, title, targetAmount]
    );

    console.log("✅ Meta creada:", result.rows[0]);
    res.json(result.rows[0]);

  } catch (error) {
    console.error("❌ ERROR POST GOAL:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Error creando meta"
    });
  }
});

export default router;