import { supabase } from "../lib/supabase";

type CreateTransactionInput = {
  child: string;
  type: string;
  description: string;
  amount: number;
  familyId: number;
  category: string;
};

export async function listTransactionsByFamilyId(familyId: number) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createTransaction(input: CreateTransactionInput) {
  const { data, error } = await supabase
    .from("transactions")
    .insert([
      {
        child: input.child,
        type: input.type,
        description: input.description,
        amount: input.amount,
        family_id: input.familyId,
        category: input.category,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
