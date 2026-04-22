import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createProject);
router.get("/", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;