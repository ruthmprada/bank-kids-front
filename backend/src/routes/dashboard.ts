import { Router } from "express";
import {
  getChildrenController,
  getDashboardController,
} from "../controllers/dashboardController";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get("/children/:familyCode", asyncHandler(getChildrenController));
router.get("/:familyCode", asyncHandler(getDashboardController));

export default router;
