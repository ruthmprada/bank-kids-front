import { HttpError } from "../lib/httpError";
import { findFamilyByCode } from "../repositories/familyRepository";
import {
  createTransaction,
  deleteTransaction,
  listTransactionsByFamilyId,
} from "../repositories/transactionRepository";

export async function getTransactionsByFamilyCode(familyCode: string) {
  const family = await findFamilyByCode(familyCode);

  if (!family) {
    throw new HttpError(404, "Familia no encontrada");
  }

  return listTransactionsByFamilyId(family.id);
}

export async function createTransactionForFamily(input: {
  child?: string;
  type?: string;
  concept?: string;
  description?: string;
  amount?: number;
  familyId?: string;
  category?: string;
}) {
  if (!input.child || !input.type || !input.amount || !input.familyId) {
    throw new HttpError(400, "Faltan campos obligatorios");
  }

  const family = await findFamilyByCode(input.familyId);

  if (!family) {
    throw new HttpError(400, "Familia no encontrada");
  }

  return createTransaction({
    child: input.child,
    type: input.type,
    description: input.description ?? input.concept ?? "",
    amount: input.amount,
    familyId: family.id,
    category: input.category ?? "otro",
  });
}

export async function deleteTransactionById(id: string) {
  await deleteTransaction(id);

  return { ok: true };
}
