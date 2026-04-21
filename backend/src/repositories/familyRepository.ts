import { supabase } from "../lib/supabase";

export async function findFamilyByCode(code: string) {
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

export async function createFamily(code: string) {
  const { data, error } = await supabase
    .from("families")
    .insert([{ code }])
    .select("id, code")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getFamilyCodeById(id: number) {
  const { data, error } = await supabase
    .from("families")
    .select("code")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.code ?? null;
}
