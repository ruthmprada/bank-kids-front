import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * ============================================
 * GET /api/transactions/:familyCode
 * ============================================
 */
router.get("/:familyCode", async (req: Request, res: Response) => {
  const { familyCode } = req.params;

  try {
    console.log("🔥 GET TRANSACTIONS:", familyCode);

    // 🔥 Obtener ID de la familia
    const { data: familyData, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("code", familyCode)
      .single();

    if (familyError || !familyData) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    const familyId = familyData.id;

    // 🔥 Obtener transacciones
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.json(data || []);

  } catch (error) {
    console.error("❌ ERROR GET TRANSACTIONS:", error);

    return res.status(500).json({
      error: error instanceof Error
        ? error.message
        : "Error obteniendo transacciones"
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

    // 🔥 Obtener ID real de familia
    const { data: familyData, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("code", familyId)
      .single();

    if (familyError || !familyData) {
      return res.status(400).json({ error: "Familia no encontrada" });
    }

    const realFamilyId = familyData.id;

    // 🔥 Insertar transacción
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          child,
          type,
          description: transactionDescription,
          amount,
          family_id: realFamilyId,
          category: category ?? "otro",
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return res.json(data[0]);

  } catch (error) {
    console.error("❌ ERROR POST TRANSACTION:", error);

    return res.status(500).json({
      error: error instanceof Error
        ? error.message
        : "Error creando transacción"
    });
  }
});

/**
 * ============================================
 * DELETE /api/transactions/:id
 * ============================================
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    console.log("🔥 DELETE TRANSACTION:", id);

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return res.json({ ok: true });

  } catch (error) {
    console.error("❌ ERROR DELETE:", error);

    return res.status(500).json({
      error: error instanceof Error
        ? error.message
        : "Error borrando movimiento"
    });
  }
});

export default router;