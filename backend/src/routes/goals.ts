import { Router } from "express";
import {
  completeGoalController,
  createGoalController,
  deleteGoalController,
  getGoalsController,
  updateGoalController,
  updateGoalStatusController,
} from "../controllers/goalController";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get("/:familyCode", asyncHandler(getGoalsController));
router.post("/", asyncHandler(createGoalController));
router.put("/:id", asyncHandler(updateGoalController));
router.patch("/:id/status", asyncHandler(updateGoalStatusController));
router.post("/:id/complete", asyncHandler(completeGoalController));
router.delete("/:id", asyncHandler(deleteGoalController));

export default router;
