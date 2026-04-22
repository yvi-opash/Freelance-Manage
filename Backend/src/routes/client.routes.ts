import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createClient,
  clientbyId,
  getClient,
  updateClient,
  deleteClient,
} from "../controllers/client.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createClient);
router.get("/", getClient);
router.get("/:id", clientbyId);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;