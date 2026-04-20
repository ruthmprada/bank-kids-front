import { Router } from "express";
import db from "../db";

const router = Router();

function normalizeGoalStatus(status?: string) {
  if (status === "pending" || status === "achieved") {
    return status;
  }

  return "approved";
}

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
  const { familyId, child, title, targetAmount, status } = req.body;

  try {
    console.log("🔥 POST GOAL:", { familyId, child, title, targetAmount, status });

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
    const goalStatus = normalizeGoalStatus(status);

    const result = await db.query(
      `INSERT INTO goals (family_id, child, title, target_amount, status, created_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       RETURNING *`,
      [realFamilyId, child, title, targetAmount, goalStatus]
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

// 🔹 ACTUALIZAR meta
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, targetAmount, status } = req.body;

  try {
    console.log("🔥 PUT GOAL:", { id, title, targetAmount });

    if (!title || !targetAmount) {
      return res.status(400).json({
        error: "Faltan campos obligatorios"
      });
    }

    const goalStatus = normalizeGoalStatus(status);

    const result = await db.query(
      `UPDATE goals
       SET title = $1, target_amount = $2, status = $3
       WHERE id = $4
       RETURNING *`,
      [title, targetAmount, goalStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Meta no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ ERROR PUT GOAL:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Error actualizando meta"
    });
  }
});

router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const goalStatus = normalizeGoalStatus(status);

    const result = await db.query(
      `UPDATE goals
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [goalStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Meta no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ ERROR PATCH GOAL STATUS:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Error cambiando el estado de la meta"
    });
  }
});

router.post("/:id/complete", async (req, res) => {
  const { id } = req.params;

  try {
    const goalResult = await db.query(
      `UPDATE goals
       SET status = 'achieved'
       WHERE id = $1 AND status <> 'achieved'
       RETURNING *`,
      [id]
    );

    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: "Meta no encontrada o ya lograda" });
    }

    const goal = goalResult.rows[0];

    let transactionResult;

    try {
      transactionResult = await db.query(
        `INSERT INTO transactions
         (child, type, description, amount, family_id, category, created_at)
         VALUES ($1,'Gasto',$2,$3,$4,$5,NOW())
         RETURNING *`,
        [
          goal.child,
          `Meta lograda: ${goal.title}`,
          goal.target_amount,
          goal.family_id,
          "ahorro",
        ]
      );
    } catch (error) {
      const dbError = error as Error & { code?: string };

      if (dbError.code === "42703") {
        transactionResult = await db.query(
          `INSERT INTO transactions
           (child, type, description, amount, family_id, created_at)
           VALUES ($1,'Gasto',$2,$3,$4,NOW())
           RETURNING *`,
          [
            goal.child,
            `Meta lograda: ${goal.title}`,
            goal.target_amount,
            goal.family_id,
          ]
        );
      } else {
        throw error;
      }
    }

    res.json({
      goal,
      transaction: transactionResult.rows[0],
    });
  } catch (error) {
    console.error("❌ ERROR COMPLETE GOAL:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Error marcando la meta como lograda"
    });
  }
});

// 🔹 BORRAR meta
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log("🔥 DELETE GOAL:", id);

    const result = await db.query(
      "DELETE FROM goals WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Meta no encontrada" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("❌ ERROR DELETE GOAL:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Error borrando meta"
    });
  }
});

export default router;
