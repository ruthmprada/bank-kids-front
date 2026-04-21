import type { Request, Response } from "express";
import {
  createTransactionForFamily,
  deleteTransactionById,
  getTransactionsByFamilyCode,
} from "../services/transactionService";

export async function getTransactionsController(req: Request, res: Response) {
  const result = await getTransactionsByFamilyCode(
    String(req.params.familyCode)
  );
  res.json(result);
}

export async function createTransactionController(req: Request, res: Response) {
  const result = await createTransactionForFamily(req.body);
  res.json(result);
}

export async function deleteTransactionController(req: Request, res: Response) {
  const result = await deleteTransactionById(String(req.params.id));
  res.json(result);
}
