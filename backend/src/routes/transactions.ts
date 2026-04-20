import { Router, Request, Response } from "express";
import db from "../db";

const router = Router();

type DbError = Error & {
  code?: string;
};

/**
 * ============================================
 * GET /api/transactions/:familyCode
 * ============================================
 */
router.get("/:familyCode", async (req: Request, res: Response) => {
  const { familyCode } = req.params;

  try {
    console.log("🔥 GET TRANSACTIONS:", familyCode);

    const familyResult = await db.query(
      "SELECT id FROM families WHERE code = $1",
      [familyCode]
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    const familyId = familyResult.rows[0].id;

    const result = await db.query(
      `SELECT * FROM transactions 
       WHERE family_id = $1 
       ORDER BY created_at DESC`, // ✅ FIX
      [familyId]
    );

    return res.json(result.rows || []);

  } catch (error) {
    console.error("❌ ERROR GET TRANSACTIONS:", error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error obteniendo transacciones"
    });
  }
});

/**
 * ============================================
 * POST /api/transactions
 * ============================================
 */
router.post("/", async (req: Request, res: Response) => {
  const {
    child,
    type,
    concept,
    description,
    amount,
    familyId,
    category,
  } = req.body;

  const transactionDescription = description ?? concept ?? "";

  try {
    console.log("🔥 POST TRANSACTION:", req.body);

    if (!child || !type || !amount || !familyId) {
      return res.status(400).json({
        error: "Faltan campos obligatorios"
      });
    }

    const familyResult = await db.query(
      "SELECT id FROM families WHERE code = $1",
      [familyId]
    );

    if (familyResult.rows.length === 0) {
      return res.status(400).json({ error: "Familia no encontrada" });
    }

    const realFamilyId = familyResult.rows[0].id;

    let result;

    try {
      result = await db.query(
        `INSERT INTO transactions 
         (child, type, description, amount, family_id, category, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,NOW())
         RETURNING *`,
        [child, type, transactionDescription, amount, realFamilyId, category ?? null]
      );
    } catch (error) {
      const dbError = error as DbError;

      // Compatibilidad con bases antiguas que todavía no tienen la columna category.
      if (dbError.code === "42703") {
        result = await db.query(
          `INSERT INTO transactions 
           (child, type, description, amount, family_id, created_at)
           VALUES ($1,$2,$3,$4,$5,NOW())
           RETURNING *`,
          [child, type, transactionDescription, amount, realFamilyId]
        );
      } else {
        throw error;
      }
    }

    return res.json(result.rows[0]);

  } catch (error) {
    console.error("❌ ERROR POST TRANSACTION:", error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error creando transacción"
    });
  }
});

/**
 * ============================================
 * DELETE
 * ============================================
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    console.log("🔥 DELETE TRANSACTION:", id);

    await db.query("DELETE FROM transactions WHERE id = $1", [id]);

    return res.json({ ok: true });

  } catch (error) {
    console.error("❌ ERROR DELETE:", error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error borrando movimiento"
    });
  }
});

export default router;
