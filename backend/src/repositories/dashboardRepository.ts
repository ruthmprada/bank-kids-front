import { supabase } from "../lib/supabase";

export async function findSavingsByFamilyId(familyId: number) {
  const { data, error } = await supabase
    .from("savings")
    .select("*")
    .eq("family_id", familyId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
}
