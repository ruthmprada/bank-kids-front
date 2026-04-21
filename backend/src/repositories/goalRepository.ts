import { supabase } from "../lib/supabase";

type CreateGoalInput = {
  familyId: number;
  child: string;
  title: string;
  targetAmount: number;
  status: "pending" | "approved" | "achieved";
};

type UpdateGoalInput = {
  title: string;
  targetAmount: number;
  status: "pending" | "approved" | "achieved";
};

export async function listGoalsByFamilyId(familyId: number) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createGoal(input: CreateGoalInput) {
  const { data, error } = await supabase
    .from("goals")
    .insert([
      {
        family_id: input.familyId,
        child: input.child,
        title: input.title,
        target_amount: input.targetAmount,
        status: input.status,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateGoal(id: string, input: UpdateGoalInput) {
  const { data, error } = await supabase
    .from("goals")
    .update({
      title: input.title,
      target_amount: input.targetAmount,
      status: input.status,
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateGoalStatus(
  id: string,
  status: "pending" | "approved" | "achieved"
) {
  const { data, error } = await supabase
    .from("goals")
    .update({ status })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function completeGoal(id: string) {
  const { data, error } = await supabase
    .from("goals")
    .update({ status: "achieved" })
    .eq("id", id)
    .neq("status", "achieved")
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteGoal(id: string) {
  const { data, error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data ?? [];
}
