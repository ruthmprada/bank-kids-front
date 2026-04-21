import type { Request, Response } from "express";
import {
  completeGoalById,
  createGoalForFamily,
  deleteGoalById,
  getGoalsByFamilyCode,
  updateGoalById,
  updateGoalStatusById,
} from "../services/goalService";

export async function getGoalsController(req: Request, res: Response) {
  const result = await getGoalsByFamilyCode(String(req.params.familyCode));
  res.json(result);
}

export async function createGoalController(req: Request, res: Response) {
  const result = await createGoalForFamily(req.body);
  res.json(result);
}

export async function updateGoalController(req: Request, res: Response) {
  const result = await updateGoalById(String(req.params.id), req.body);
  res.json(result);
}

export async function updateGoalStatusController(req: Request, res: Response) {
  const result = await updateGoalStatusById(
    String(req.params.id),
    req.body.status
  );
  res.json(result);
}

export async function completeGoalController(req: Request, res: Response) {
  const result = await completeGoalById(String(req.params.id));
  res.json(result);
}

export async function deleteGoalController(req: Request, res: Response) {
  const result = await deleteGoalById(String(req.params.id));
  res.json(result);
}
