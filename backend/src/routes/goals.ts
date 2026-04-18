import { Router } from "express";
import db from "../db";

const router = Router();

// 🔹 GET metas por familia
router.get("/:familyCode", async (req, res) => {
  const { familyCode } = req.params;

  try {
    const family = await db.query(
      "SELECT id FROM families WHERE code = $1",
      [familyCode]
    );

    const familyId = family.rows[0]?.id;

    const result = await db.query(
      "SELECT * FROM goals WHERE family_id = $1 ORDER BY created_at DESC",
      [familyId]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: "Error obteniendo metas" });
  }
});

// 🔹 CREAR meta
router.post("/", async (req, res) => {
  const { familyId, child, title, targetAmount } = req.body;

  try {
    const family = await db.query(
      "SELECT id FROM families WHERE code = $1",
      [familyId]
    );

    const realFamilyId = family.rows[0]?.id;

    const result = await db.query(
      `INSERT INTO goals (family_id, child, title, target_amount)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [realFamilyId, child, title, targetAmount]
    );

    res.json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: "Error creando meta" });
  }
});

export default router;