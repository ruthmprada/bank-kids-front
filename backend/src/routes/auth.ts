import { Router } from "express";
import {
  getAvatarPresetsController,
  getCurrentUserController,
  getFamilyMembersController,
  loginController,
  registerController,
  updateUserController,
} from "../controllers/authController";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

console.log("🔥 AUTH SUPABASE ACTIVO");

router.get("/avatar-presets", asyncHandler(getAvatarPresetsController));
router.get("/me", asyncHandler(getCurrentUserController));
router.get(
  "/family-members/:familyCode",
  asyncHandler(getFamilyMembersController)
);
router.post("/register", asyncHandler(registerController));
router.post("/login", asyncHandler(loginController));
router.put("/users/:id", asyncHandler(updateUserController));

export default router;
