import type { Request, Response } from "express";
import {
  getAvatarPresets,
  getFamilyMembers,
  loginUser,
  registerUser,
  updateUserProfile,
} from "../services/authService";

export async function getAvatarPresetsController(_req: Request, res: Response) {
  const presets = await getAvatarPresets();
  res.json(presets);
}

export async function getFamilyMembersController(req: Request, res: Response) {
  const members = await getFamilyMembers(String(req.params.familyCode));
  res.json(members);
}

export async function registerController(req: Request, res: Response) {
  const result = await registerUser(req.body);
  res.json(result);
}

export async function loginController(req: Request, res: Response) {
  const result = await loginUser(req.body);
  res.json(result);
}

export async function updateUserController(req: Request, res: Response) {
  const result = await updateUserProfile(String(req.params.id), req.body);
  res.json(result);
}
