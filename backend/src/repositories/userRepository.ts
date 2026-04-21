import { supabase } from "../lib/supabase";

type CreateUserInput = {
  username: string;
  password: string;
  role: "parent" | "child";
  familyId: number;
  avatar?: string | null;
};

type UpdateUserInput = {
  username: string;
  password: string;
  avatar?: string | null;
};

export async function listAvatarPresets() {
  const { data, error } = await supabase
    .from("avatar_presets")
    .select("id, label, image_url")
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listUsersByFamilyId(familyId: number) {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, role, avatar")
    .eq("family_id", familyId)
    .order("role", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listChildrenByFamilyId(familyId: number) {
  const { data, error } = await supabase
    .from("users")
    .select("username, role, avatar")
    .eq("family_id", familyId)
    .eq("role", "child");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function findUsersByUsername(username: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .ilike("username", username);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function findUserByUsername(username: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function findUserById(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createUser(input: CreateUserInput) {
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        username: input.username,
        password: input.password,
        role: input.role,
        family_id: input.familyId,
        avatar: input.avatar ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const { data, error } = await supabase
    .from("users")
    .update({
      username: input.username,
      password: input.password,
      avatar: input.avatar ?? null,
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
