import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { HttpError } from "../lib/httpError";
import { supabase, supabaseAuth } from "../lib/supabase";
import {
  createFamily,
  findFamilyByCode,
  getFamilyCodeById,
} from "../repositories/familyRepository";
import {
  createUser,
  findUserByAuthUserId,
  findUserByAuthEmail,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  findUsersByEmail,
  findUsersByAuthEmail,
  findUsersByUsername,
  listAvatarPresets,
  listUsersByFamilyId,
  updateUser,
} from "../repositories/userRepository";

type Role = "parent" | "child";

type RegisterInput = {
  username?: string;
  email?: string;
  password?: string;
  role?: Role;
  familyId?: string | null;
  avatar?: string | null;
};

type LoginInput = {
  username?: string;
  email?: string;
  password?: string;
  role?: Role;
};

type UpdateUserInput = {
  username?: string;
  avatar?: string | null;
  password?: string;
};

async function createUniqueFamily() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();

    try {
      return await createFamily(code);
    } catch (error) {
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
  }

  throw new HttpError(500, "No se pudo generar un código familiar único");
}

function buildInternalChildAuthEmail() {
  return `child-${randomUUID()}@piggybank.local`;
}

async function createAuthUser(params: {
  authEmail: string;
  password: string;
  username: string;
  role: Role;
  familyCode: string;
}) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: params.authEmail,
    password: params.password,
    email_confirm: true,
    user_metadata: {
      username: params.username,
      role: params.role,
      familyCode: params.familyCode,
    },
  });

  if (error) {
    throw new HttpError(400, error.message);
  }

  if (!data.user) {
    throw new HttpError(500, "No se pudo crear el usuario en Supabase Auth");
  }

  return data.user;
}

async function createAuthSession(authEmail: string, password: string) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (error) {
    throw new HttpError(400, error.message);
  }

  if (!data.user || !data.session) {
    throw new HttpError(400, "No se pudo iniciar sesión");
  }

  return data;
}

export async function getAvatarPresets() {
  return listAvatarPresets();
}

export async function getFamilyMembers(familyCode: string) {
  const normalizedCode = familyCode.trim().toUpperCase();
  const family = await findFamilyByCode(normalizedCode);

  if (!family) {
    throw new HttpError(404, "Familia no encontrada");
  }

  const users = await listUsersByFamilyId(family.id);

  return users.map((user) => ({
    ...user,
    familyCode: family.code,
  }));
}

export async function registerUser(input: RegisterInput) {
  const username = input.username?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password;
  const role = input.role;
  const familyCode = input.familyId?.trim().toUpperCase();

  if (!username || !password || !role) {
    throw new HttpError(400, "Campos obligatorios faltantes");
  }

  if (!["parent", "child"].includes(role)) {
    throw new HttpError(400, "Rol inválido");
  }

  if (password.length < 6) {
    throw new HttpError(400, "La contraseña debe tener al menos 6 caracteres");
  }

  const existingUsers = await findUsersByUsername(username);
  if (existingUsers.length > 0) {
    throw new HttpError(400, "El usuario ya existe");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let family;
  let authEmail = "";
  let publicEmail: string | null = null;

  if (role === "parent") {
    if (!email) {
      throw new HttpError(400, "El email es obligatorio para padres");
    }

    const existingEmails = await findUsersByEmail(email);

    if (existingEmails.length > 0) {
      throw new HttpError(400, "El email ya existe");
    }

    if (familyCode) {
      family = await findFamilyByCode(familyCode);

      if (!family) {
        throw new HttpError(400, "Código inválido");
      }
    } else {
      family = await createUniqueFamily();
    }

    authEmail = email;
    publicEmail = email;
  } else {
    if (!familyCode) {
      throw new HttpError(400, "Código familiar requerido");
    }

    family = await findFamilyByCode(familyCode);

    if (!family) {
      throw new HttpError(400, "Código inválido");
    }

    do {
      authEmail = buildInternalChildAuthEmail();
    } while ((await findUsersByAuthEmail(authEmail)).length > 0);
  }

  const authUser = await createAuthUser({
    authEmail,
    password,
    username,
    role,
    familyCode: family.code,
  });

  const user = await createUser({
    username,
    email: publicEmail,
    authEmail,
    authUserId: authUser.id,
    password: hashedPassword,
    role,
    familyId: family.id,
    avatar: input.avatar ?? null,
  });

  const authSession = await createAuthSession(authEmail, password);

  return {
    message: "Usuario creado",
    familyCode: family.code,
    user: {
      username,
      email: publicEmail ?? undefined,
      role,
      familyId: family.code,
      avatar: user.avatar ?? null,
    },
    session: authSession.session,
  };
}

export async function loginUser(input: LoginInput) {
  const username = input.username?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password;
  const role = input.role;

  if (!password || !role || !["parent", "child"].includes(role)) {
    throw new HttpError(400, "Credenciales inválidas");
  }

  let authEmail = "";
  let appUser: any = null;

  if (role === "parent") {
    if (!email) {
      throw new HttpError(400, "El email es obligatorio");
    }

    authEmail = email;
    appUser = await findUserByEmail(email);
    if (!appUser) {
      throw new HttpError(400, "Usuario no encontrado");
    }
  } else {
    if (!username) {
      throw new HttpError(400, "Usuario y contraseña requeridos");
    }

    const childUser = await findUserByUsername(username);

    if (!childUser) {
      throw new HttpError(400, "Usuario no encontrado");
    }

    if (childUser.role !== "child") {
      throw new HttpError(400, "Este usuario no es un niño");
    }

    authEmail = childUser.auth_email;
    appUser = childUser;
  }

  const authData = await createAuthSession(authEmail, password);

  if (!appUser) {
    throw new HttpError(400, "Usuario no encontrado en base de datos");
  }

  if (appUser.role !== role) {
    throw new HttpError(400, "Rol incorrecto");
  }

  const familyCodeFromUser = await getFamilyCodeById(appUser.family_id);

  return {
    message: "Login correcto",
    user: {
      username: appUser.username,
      email: appUser.email ?? undefined,
      role: appUser.role,
      familyId: familyCodeFromUser,
      avatar: appUser.avatar ?? null,
    },
    session: authData.session,
  };
}

export async function getCurrentUser(accessToken: string) {
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new HttpError(401, "Sesión no válida");
  }

  const appUser =
    (await findUserByAuthUserId(data.user.id)) ||
    (data.user.email ? await findUserByEmail(data.user.email) : null);

  if (!appUser) {
    throw new HttpError(404, "Usuario no encontrado");
  }

  const familyCode = await getFamilyCodeById(appUser.family_id);

  return {
    username: appUser.username,
    email: appUser.email ?? undefined,
    role: appUser.role,
    familyId: familyCode,
    avatar: appUser.avatar ?? null,
  };
}

export async function updateUserProfile(id: string, input: UpdateUserInput) {
  const username = input.username?.trim();

  if (!username) {
    throw new HttpError(400, "Username obligatorio");
  }

  const existingUser = await findUserById(id);

  if (!existingUser) {
    throw new HttpError(404, "Usuario no encontrado");
  }

  const hashedPassword = input.password
    ? await bcrypt.hash(input.password, 10)
    : existingUser.password;

  const updatedUser = await updateUser(id, {
    username,
    avatar: input.avatar ?? null,
    password: hashedPassword,
  });

  if (!updatedUser) {
    throw new HttpError(404, "Usuario no encontrado");
  }

  const familyCode = await getFamilyCodeById(updatedUser.family_id);

  return {
    id: updatedUser.id,
    username: updatedUser.username,
    role: updatedUser.role,
    avatar: updatedUser.avatar,
    familyId: familyCode ?? null,
  };
}
