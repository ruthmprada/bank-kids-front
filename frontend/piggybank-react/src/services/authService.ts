import type {
  RegisterInput,
  RegisterResult,
  StoredUser,
  User,
} from "../types";

const USERS_KEY = "users";
const SESSION_KEY = "user";

function readJson<T>(key: string, fallback: T): T {
  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function normalizeUsername(username: string) {
  return username.trim();
}

function generateFamilyId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function toSessionUser(user: StoredUser): User {
  return {
    username: user.username,
    role: user.role,
    familyId: user.familyId,
  };
}

export function getUsers() {
  return readJson<StoredUser[]>(USERS_KEY, []);
}

export function getStoredUser() {
  return readJson<User | null>(SESSION_KEY, null);
}

export function saveStoredUser(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function login(username: string, password: string) {
  const normalizedUsername = normalizeUsername(username);
  const users = getUsers();

  const user = users.find(
    (candidate) =>
      candidate.username.toLowerCase() === normalizedUsername.toLowerCase() &&
      candidate.password === password
  );

  if (!user) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  return toSessionUser(user);
}

export function registerUser({
  username,
  password,
  role,
  familyCode,
}: RegisterInput): RegisterResult {
  const normalizedUsername = normalizeUsername(username);
  const normalizedFamilyCode = familyCode?.trim().toUpperCase();
  const users = getUsers();

  if (!normalizedUsername) {
    throw new Error("El usuario es obligatorio");
  }

  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  const usernameTaken = users.some(
    (candidate) =>
      candidate.username.toLowerCase() === normalizedUsername.toLowerCase()
  );

  if (usernameTaken) {
    throw new Error("Ese nombre de usuario ya existe");
  }

  let familyId = normalizedFamilyCode;

  if (role === "parent") {
    do {
      familyId = generateFamilyId();
    } while (users.some((candidate) => candidate.familyId === familyId));
  } else {
    if (!normalizedFamilyCode) {
      throw new Error("El código familiar es obligatorio");
    }

    const familyExists = users.some(
      (candidate) => candidate.familyId === normalizedFamilyCode
    );

    if (!familyExists) {
      throw new Error("El código familiar no existe");
    }
  }

  const newUser: StoredUser = {
    username: normalizedUsername,
    password,
    role,
    familyId: familyId!,
  };

  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));

  return {
    user: toSessionUser(newUser),
    familyId: newUser.familyId,
  };
}
