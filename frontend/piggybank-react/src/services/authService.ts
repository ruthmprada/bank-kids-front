import type { Session } from "@supabase/supabase-js";
import type { User } from "../types";
import { supabase } from "./supabaseClient";

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

export function getStoredUser() {
  return readJson<User | null>(SESSION_KEY, null);
}

export function saveStoredUser(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(SESSION_KEY);
}

async function applySession(session: Session | null) {
  if (!session) {
    return;
  }

  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (error) {
    throw error;
  }
}

export async function fetchAuthenticatedUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    clearStoredUser();
    return null;
  }

  const res = await fetch("http://localhost:3000/api/auth/me", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    clearStoredUser();
    await supabase.auth.signOut();
    throw new Error(data.error || "No se pudo recuperar la sesión");
  }

  saveStoredUser(data.user);
  return data.user as User;
}

export async function registerWithSupabase(input: {
  username: string;
  email?: string;
  password: string;
  role: "parent" | "child";
  familyId?: string | null;
  avatar?: string;
}) {
  const res = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error en registro");
  }

  await applySession(data.session ?? null);
  saveStoredUser(data.user);

  return data;
}

export async function loginWithSupabase(input: {
  username?: string;
  email?: string;
  password: string;
  role: "parent" | "child";
  familyId?: string;
}) {
  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error en login");
  }

  await applySession(data.session ?? null);
  saveStoredUser(data.user);

  return data;
}

export async function logoutFromSupabase() {
  clearStoredUser();
  await supabase.auth.signOut();
}
