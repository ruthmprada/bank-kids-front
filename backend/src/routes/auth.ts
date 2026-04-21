import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import bcrypt from "bcrypt";

const router = Router();

console.log("🔥 AUTH SUPABASE ACTIVO");

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

async function getFamilyByCode(code: string) {
  const { data, error } = await supabase
    .from("families")
    .select("id, code")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function createFamily() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from("families")
      .insert([{ code }])
      .select("id, code")
      .single();

    if (!error && data) {
      return data;
    }

    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : "";

    if (errorCode === "23505") {
      continue;
    }

    throw error;
  }

  throw new Error("No se pudo generar un código familiar único");
}

/**
 * ============================================
 * AVATAR PRESETS
 * ============================================
 */
router.get("/avatar-presets", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("avatar_presets")
      .select("id, label, image_url")
      .order("id", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("💥 ERROR AVATAR PRESETS:", error);
    res.status(500).json({ error: "Error obteniendo avatares" });
  }
});

/**
 * ============================================
 * FAMILY MEMBERS
 * ============================================
 */
router.get("/family-members/:familyCode", async (req, res) => {
  const { familyCode } = req.params;

  try {
    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("id, code")
      .eq("code", familyCode.trim().toUpperCase())
      .single();

    if (familyError || !family) {
      return res.status(404).json({ error: "Familia no encontrada" });
    }

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, username, role, avatar")
      .eq("family_id", family.id)
      .order("role", { ascending: true });

    if (usersError) throw usersError;

    res.json(
      users.map((u) => ({
        ...u,
        familyCode: family.code,
      }))
    );
  } catch (error) {
    console.error("💥 ERROR FAMILY MEMBERS:", error);
    res.status(500).json({ error: "Error obteniendo perfiles" });
  }
});

/**
 * ============================================
 * REGISTER
 * ============================================
 */
router.post("/register", async (req, res) => {
  let { username, password, role, familyId, avatar } = req.body;

  username = username?.trim();
  familyId = familyId?.trim().toUpperCase();

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Campos obligatorios faltantes" });
  }

  if (!["parent", "child"].includes(role)) {
    return res.status(400).json({ error: "Rol inválido" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  try {
    // 🔍 comprobar usuario existente
    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .ilike("username", username);

    if (existingError) {
      throw existingError;
    }

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let family;

    // 👨 PADRE
    if (role === "parent") {
      if (familyId) {
        const data = await getFamilyByCode(familyId);

        if (!data) {
          return res.status(400).json({ error: "Código inválido" });
        }

        family = data;
      } else {
        family = await createFamily();
      }
    }

    // 👶 HIJO
    else {
      if (!familyId) {
        return res.status(400).json({
          error: "Código familiar requerido",
        });
      }

      const data = await getFamilyByCode(familyId);

      if (!data) {
        return res.status(400).json({ error: "Código inválido" });
      }

      family = data;
    }

    // 👤 insertar usuario
    const { data: userData, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          password: hashedPassword,
          role,
          family_id: family.id,
          avatar: avatar ?? null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Usuario creado",
      familyCode: family.code,
      user: {
        username,
        role,
        familyId: family.code,
        avatar: userData.avatar ?? null,
      },
    });

  } catch (error) {
    console.error("💥 ERROR REGISTER:", error);
    res.status(500).json({
      error: getErrorMessage(error, "Error en registro"),
    });
  }
});

/**
 * ============================================
 * LOGIN
 * ============================================
 */
router.post("/login", async (req, res) => {
  let { username, password, role } = req.body;

  username = username?.trim();

  if (!role || !["parent", "child"].includes(role)) {
    return res.status(400).json({ error: "Rol inválido" });
  }

  try {
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .ilike("username", username)
      .single();

    if (!users) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    if (users.role !== role) {
      return res.status(400).json({
        error: "Rol incorrecto",
      });
    }

    const isMatch = await bcrypt.compare(password, users.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    const { data: family } = await supabase
      .from("families")
      .select("code")
      .eq("id", users.family_id)
      .single();

    res.json({
      message: "Login correcto",
      user: {
        username: users.username,
        role: users.role,
        familyId: family?.code,
        avatar: users.avatar ?? null,
      },
    });

  } catch (error) {
    console.error("💥 ERROR LOGIN:", error);
    res.status(500).json({
      error: getErrorMessage(error, "Error en login"),
    });
  }
});

/**
 * ============================================
 * UPDATE USER
 * ============================================
 */
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, avatar, password } = req.body;

  const trimmed = username?.trim();

  if (!trimmed) {
    return res.status(400).json({ error: "Username obligatorio" });
  }

  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let hashedPassword = existingUser.password;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const { data: updated } = await supabase
      .from("users")
      .update({
        username: trimmed,
        avatar: avatar ?? null,
        password: hashedPassword,
      })
      .eq("id", id)
      .select()
      .single();

    const { data: family } = await supabase
      .from("families")
      .select("code")
      .eq("id", updated.family_id)
      .single();

    res.json({
      id: updated.id,
      username: updated.username,
      role: updated.role,
      avatar: updated.avatar,
      familyId: family?.code ?? null,
    });

  } catch (error) {
    console.error("💥 ERROR UPDATE USER:", error);
    res.status(500).json({
      error: getErrorMessage(error, "Error actualizando usuario"),
    });
  }
});

export default router;
