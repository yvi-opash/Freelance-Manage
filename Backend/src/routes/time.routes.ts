import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createTimeEntry,
  getTimeEntry,
  deleteTimeEntry,
} from "../controllers/time.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createTimeEntry);
router.get("/", getTimeEntry);
router.delete("/:id", deleteTimeEntry);

export default router;