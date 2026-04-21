import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * ============================================
 * GET /children/:familyCode
 * ============================================
 */
router.get("/children/:familyCode", async (req: Request, res: Response) => {
  const { familyCode } = req.params;

  try {
    // 🔍 Obtener familia
    const { data: familyData, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("code", familyCode)
      .single();

    if (familyError || !familyData) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    // 👶 Obtener hijos
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("username, role, avatar")
      .eq("family_id", familyData.id)
      .eq("role", "child");

    if (usersError) throw usersError;

    const users = (usersData || []).map((user) => ({
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      family_code: familyCode,
    }));

    res.json(users);

  } catch (error) {
    console.error("❌ ERROR GET CHILDREN:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error obteniendo hijos",
    });
  }
});

/**
 * ============================================
 * GET /:familyCode  (Dashboard)
 * ============================================
 */
router.get("/:familyCode", async (req: Request, res: Response) => {
  const { familyCode } = req.params;

  try {
    // 🔍 Buscar familia
    const { data: familyData, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("code", familyCode)
      .single();

    if (familyError || !familyData) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    // 💰 Obtener savings
    const { data: savingsData, error: savingsError } = await supabase
      .from("savings")
      .select("*")
      .eq("family_id", familyData.id)
      .single();

    // 🟡 Si no hay datos aún
    if (savingsError || !savingsData) {
      return res.json({
        currentSavings: 0,
        goalProgress: 0,
        goalTarget: 200,
      });
    }

    // ✅ Respuesta
    res.json({
      currentSavings: Number(savingsData.amount),
      goalProgress: Number(savingsData.amount),
      goalTarget: Number(savingsData.goal_target),
    });

  } catch (error) {
    console.error("❌ ERROR DASHBOARD:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error cargando dashboard",
    });
  }
});

export default router;