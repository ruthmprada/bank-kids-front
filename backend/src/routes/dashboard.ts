import { Router, Request, Response } from "express";
import db from "../db";

const router = Router();

/**
 * ============================================
 * ENDPOINT: GET /children/:familyCode
 * ============================================
 * 🔥 IMPORTANTE: esta ruta va PRIMERO
 */
router.get("/children/:familyCode", async (req: Request, res: Response) => {
  const { familyCode } = req.params;

  try {
    // 🔍 Buscar ID de la familia
    const familyResult = await db.query(
      "SELECT id FROM families WHERE code = $1",
      [familyCode]
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    const familyId = familyResult.rows[0].id;

    // 👶 Obtener hijos
    const usersResult = await db.query(
      `SELECT users.username, users.role, users.avatar, families.code as family_code
       FROM users
       JOIN families ON users.family_id = families.id
       WHERE users.family_id = $1 AND users.role = 'child'`,
      [familyId]
    );

    res.json(usersResult.rows);

  } catch (error) {
    console.error("ERROR GET CHILDREN:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Error obteniendo hijos"
    });
  }
});

/**
 * ============================================
 * ENDPOINT: GET /:familyCode
 * ============================================
 */
router.get("/:familyCode", async (req: Request, res: Response) => {
  const { familyCode } = req.params;

  try {
    // 🔍 Buscar familia
    const familyResult = await db.query(
      "SELECT * FROM families WHERE code = $1",
      [familyCode]
    );

    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    const family = familyResult.rows[0];

    // 💰 Obtener ahorros
    const savingsResult = await db.query(
      "SELECT * FROM savings WHERE family_id = $1",
      [family.id]
    );

    const data = savingsResult.rows[0];

    // 🟡 Si no hay datos aún
    if (!data) {
      return res.json({
        currentSavings: 0,
        goalProgress: 0,
        goalTarget: 200
      });
    }

    // ✅ Respuesta
    res.json({
      currentSavings: Number(data.amount),
      goalProgress: Number(data.amount),
      goalTarget: Number(data.goal_target)
    });

  } catch (error) {
    console.error("ERROR DASHBOARD:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Error cargando dashboard"
    });
  }
});

export default router;
