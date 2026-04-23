import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createExpense,
  getExpense,
  deleteExpense,
  updateExpense,
  downloadExpenses,
} from "../controllers/expense.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createExpense);
router.get("/", getExpense);
router.get("/download", downloadExpenses);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;