import { HttpError } from "../lib/httpError";
import { findFamilyByCode } from "../repositories/familyRepository";
import {
  completeGoal,
  createGoal,
  deleteGoal,
  listGoalsByFamilyId,
  updateGoal,
  updateGoalStatus,
} from "../repositories/goalRepository";
import { createTransaction } from "../repositories/transactionRepository";

function normalizeGoalStatus(status?: string) {
  if (status === "pending" || status === "achieved") {
    return status;
  }

  return "approved";
}

export async function getGoalsByFamilyCode(familyCode: string) {
  const family = await findFamilyByCode(familyCode);

  if (!family) {
    throw new HttpError(404, "Familia no encontrada");
  }

  return listGoalsByFamilyId(family.id);
}

export async function createGoalForFamily(input: {
  familyId?: string;
  child?: string;
  title?: string;
  targetAmount?: number;
  status?: string;
}) {
  if (!input.familyId || !input.child || !input.title || !input.targetAmount) {
    throw new HttpError(400, "Faltan campos obligatorios");
  }

  const family = await findFamilyByCode(input.familyId);

  if (!family) {
    throw new HttpError(400, "Familia no encontrada");
  }

  return createGoal({
    familyId: family.id,
    child: input.child,
    title: input.title,
    targetAmount: input.targetAmount,
    status: normalizeGoalStatus(input.status),
  });
}

export async function updateGoalById(id: string, input: {
  title?: string;
  targetAmount?: number;
  status?: string;
}) {
  if (!input.title || !input.targetAmount) {
    throw new HttpError(400, "Faltan campos obligatorios");
  }

  const goal = await updateGoal(id, {
    title: input.title,
    targetAmount: input.targetAmount,
    status: normalizeGoalStatus(input.status),
  });

  if (!goal) {
    throw new HttpError(404, "Meta no encontrada");
  }

  return goal;
}

export async function updateGoalStatusById(id: string, status?: string) {
  const goal = await updateGoalStatus(id, normalizeGoalStatus(status));

  if (!goal) {
    throw new HttpError(404, "Meta no encontrada");
  }

  return goal;
}

export async function completeGoalById(id: string) {
  const goal = await completeGoal(id);

  if (!goal) {
    throw new HttpError(404, "Meta no encontrada o ya lograda");
  }

  const transaction = await createTransaction({
    child: goal.child,
    type: "Gasto",
    description: `Meta lograda: ${goal.title}`,
    amount: goal.target_amount,
    familyId: goal.family_id,
    category: "ahorro",
  });

  return { goal, transaction };
}

export async function deleteGoalById(id: string) {
  const deletedGoals = await deleteGoal(id);

  if (deletedGoals.length === 0) {
    throw new HttpError(404, "Meta no encontrada");
  }

  return { ok: true };
}
