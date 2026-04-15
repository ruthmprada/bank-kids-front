import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/:familyCode", async (req, res) => {
  const { familyCode } = req.params;

  try {
    const familyResult = await pool.query(
      "SELECT * FROM families WHERE code = $1",
      [familyCode]
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    const family = familyResult.rows[0];

    const savingsResult = await pool.query(
      "SELECT * FROM savings WHERE family_id = $1",
      [family.id]
    );

    const data = savingsResult.rows[0];

    if (!data) {
      return res.json({
        currentSavings: 0,
        goalProgress: 0,
        goalTarget: 200
      });
    }

    res.json({
      currentSavings: Number(data.amount),
      goalProgress: Number(data.amount),
      goalTarget: Number(data.goal_target)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error cargando dashboard" });
  }
});



router.get("/children/:familyCode", async (req, res) => {
  const { familyCode } = req.params;

  try {
    const familyResult = await pool.query(
      "SELECT id FROM families WHERE code = $1",
      [familyCode]
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    const familyId = familyResult.rows[0].id;

    const usersResult = await pool.query(
  `SELECT users.username, users.role, families.code as family_code
   FROM users
   JOIN families ON users.family_id = families.id
   WHERE users.family_id = $1 AND users.role = 'child'`,
  [familyId]
);

    res.json(usersResult.rows);

  } catch (error) {
    console.error("ERROR GET CHILDREN:", error);
    res.status(500).json({ error: "Error obteniendo hijos" });
  }
});

export default router;