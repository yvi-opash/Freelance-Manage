import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createExpense,
  getExpense,
  deleteExpense,
} from "../controllers/expense.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createExpense);
router.get("/", getExpense);
router.delete("/:id", deleteExpense);

export default router;