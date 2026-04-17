import { Router, Request, Response } from "express";
import db from "../db";

const router = Router();

// GET
router.get("/:familyId", async (req: Request, res: Response) => {
  const { familyId } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM transactions WHERE family_id = $1 ORDER BY date DESC",
      [familyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener movimientos" });
  }
});

// POST
router.post("/", async (req: Request, res: Response) => {
  const { child, type, concept, amount, familyId } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO transactions (child, type, concept, amount, family_id, date)
       VALUES ($1,$2,$3,$4,$5,NOW())
       RETURNING *`,
      [child, type, concept, amount, familyId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear movimiento" });
  }
});

// DELETE
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM transactions WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al borrar movimiento" });
  }
});

export default router;