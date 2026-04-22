import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createInvoice,
  getInvoices,
  updateInvoiceStatus,
} from "../controllers/invoice.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createInvoice);
router.get("/", getInvoices);
router.put("/:id/status", updateInvoiceStatus);

export default router;