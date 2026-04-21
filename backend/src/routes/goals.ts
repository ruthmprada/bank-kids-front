import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

function normalizeGoalStatus(status?: string) {
  if (status === "pending" || status === "achieved") {
    return status;
  }
  return "approved";
}

/**
 * ============================================
 * GET /api/goals/:familyCode
 * ============================================
 */
router.get("/:familyCode", async (req: Request, res: Response) => {
  const { familyCode } = req.params;

  try {
    console.log("🔥 GET GOALS:", familyCode);

    const { data: familyData, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("code", familyCode)
      .single();

    if (familyError || !familyData) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("family_id", familyData.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("❌ ERROR GET GOALS:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo metas",
    });
  }
});

/**
 * ============================================
 * POST /api/goals
 * ============================================
 */
router.post("/", async (req: Request, res: Response) => {
  const { familyId, child, title, targetAmount, status } = req.body;

  try {
    console.log("🔥 POST GOAL:", req.body);

    if (!familyId || !child || !title || !targetAmount) {
      return res.status(400).json({
        error: "Faltan campos obligatorios",
      });
    }

    const { data: familyData, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("code", familyId)
      .single();

    if (familyError || !familyData) {
      return res.status(400).json({ error: "Familia no encontrada" });
    }

    const goalStatus = normalizeGoalStatus(status);

    const { data, error } = await supabase
      .from("goals")
      .insert([
        {
          family_id: familyData.id,
          child,
          title,
          target_amount: targetAmount,
          status: goalStatus,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("❌ ERROR POST GOAL:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error creando meta",
    });
  }
});

/**
 * ============================================
 * PUT /api/goals/:id
 * ============================================
 */
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, targetAmount, status } = req.body;

  try {
    if (!title || !targetAmount) {
      return res.status(400).json({
        error: "Faltan campos obligatorios",
      });
    }

    const goalStatus = normalizeGoalStatus(status);

    const { data, error } = await supabase
      .from("goals")
      .update({
        title,
        target_amount: targetAmount,
        status: goalStatus,
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Meta no encontrada" });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ ERROR PUT GOAL:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error actualizando meta",
    });
  }
});

/**
 * ============================================
 * PATCH /api/goals/:id/status
 * ============================================
 */
router.patch("/:id/status", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const goalStatus = normalizeGoalStatus(status);

    const { data, error } = await supabase
      .from("goals")
      .update({ status: goalStatus })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Meta no encontrada" });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ ERROR PATCH STATUS:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error cambiando estado",
    });
  }
});

/**
 * ============================================
 * POST /api/goals/:id/complete
 * ============================================
 */
router.post("/:id/complete", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // 🔥 actualizar meta
    const { data: goal, error: goalError } = await supabase
      .from("goals")
      .update({ status: "achieved" })
      .eq("id", id)
      .neq("status", "achieved")
      .select()
      .single();

    if (goalError || !goal) {
      return res.status(404).json({
        error: "Meta no encontrada o ya lograda",
      });
    }

    // 🔥 crear transacción automática
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert([
        {
          child: goal.child,
          type: "Gasto",
          description: `Meta lograda: ${goal.title}`,
          amount: goal.target_amount,
          family_id: goal.family_id,
          category: "ahorro",
        },
      ])
      .select()
      .single();

    if (txError) throw txError;

    res.json({ goal, transaction });
  } catch (error) {
    console.error("❌ ERROR COMPLETE GOAL:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error completando meta",
    });
  }
});

/**
 * ============================================
 * DELETE /api/goals/:id
 * ============================================
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Meta no encontrada" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("❌ ERROR DELETE GOAL:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error borrando meta",
    });
  }
});

export default router;