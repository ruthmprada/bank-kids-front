import bcrypt from "bcrypt";
import { HttpError } from "../lib/httpError";
import {
  createFamily,
  findFamilyByCode,
  getFamilyCodeById,
} from "../repositories/familyRepository";
import {
  createUser,
  findUserById,
  findUserByUsername,
  findUsersByUsername,
  listAvatarPresets,
  listUsersByFamilyId,
  updateUser,
} from "../repositories/userRepository";

type Role = "parent" | "child";

type RegisterInput = {
  username?: string;
  password?: string;
  role?: Role;
  familyId?: string | null;
  avatar?: string | null;
};

type LoginInput = {
  username?: string;
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

  if (role === "parent") {
    if (familyCode) {
      family = await findFamilyByCode(familyCode);

      if (!family) {
        throw new HttpError(400, "Código inválido");
      }
    } else {
      family = await createUniqueFamily();
    }
  } else {
    if (!familyCode) {
      throw new HttpError(400, "Código familiar requerido");
    }

    family = await findFamilyByCode(familyCode);

    if (!family) {
      throw new HttpError(400, "Código inválido");
    }
  }

  const user = await createUser({
    username,
    password: hashedPassword,
    role,
    familyId: family.id,
    avatar: input.avatar ?? null,
  });

  return {
    message: "Usuario creado",
    familyCode: family.code,
    user: {
      username,
      role,
      familyId: family.code,
      avatar: user.avatar ?? null,
    },
  };
}

export async function loginUser(input: LoginInput) {
  const username = input.username?.trim();
  const password = input.password;
  const role = input.role;

  if (!role || !["parent", "child"].includes(role)) {
    throw new HttpError(400, "Rol inválido");
  }

  const user = await findUserByUsername(username ?? "");

  if (!user) {
    throw new HttpError(400, "Usuario no encontrado");
  }

  if (user.role !== role) {
    throw new HttpError(400, "Rol incorrecto");
  }

  const isMatch = await bcrypt.compare(password ?? "", user.password);

  if (!isMatch) {
    throw new HttpError(400, "Contraseña incorrecta");
  }

  const familyCode = await getFamilyCodeById(user.family_id);

  return {
    message: "Login correcto",
    user: {
      username: user.username,
      role: user.role,
      familyId: familyCode,
      avatar: user.avatar ?? null,
    },
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
