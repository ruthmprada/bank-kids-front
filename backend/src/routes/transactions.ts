import { Router } from "express";
import {
  createTransactionController,
  deleteTransactionController,
  getTransactionsController,
} from "../controllers/transactionController";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get("/:familyCode", asyncHandler(getTransactionsController));
router.post("/", asyncHandler(createTransactionController));
router.delete("/:id", asyncHandler(deleteTransactionController));

export default router;
