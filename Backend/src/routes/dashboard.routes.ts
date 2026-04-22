import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { dashboard } from "../controllers/dashboard.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", dashboard);

export default router;