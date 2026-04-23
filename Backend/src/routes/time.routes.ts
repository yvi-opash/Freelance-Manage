import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createTimeEntryController,
  getTimeEntry,
  deleteTimeEntryController,
  startTimer,
  stopTimer,
} from "../controllers/time.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createTimeEntryController);
router.get("/", getTimeEntry);
router.delete("/:id", deleteTimeEntryController);
router.post("/start", startTimer);
router.post("/:id/stop", stopTimer);

export default router;