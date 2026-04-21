import type { Request, Response } from "express";
import {
  getChildrenByFamilyCode,
  getDashboardByFamilyCode,
} from "../services/dashboardService";

export async function getChildrenController(req: Request, res: Response) {
  const result = await getChildrenByFamilyCode(String(req.params.familyCode));
  res.json(result);
}

export async function getDashboardController(req: Request, res: Response) {
  const result = await getDashboardByFamilyCode(String(req.params.familyCode));
  res.json(result);
}
