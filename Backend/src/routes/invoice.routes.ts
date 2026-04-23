import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createInvoice,
  getInvoices,
  updateInvoiceStatus,
  deleteInvoice,
  downloadInvoice,
} from "../controllers/invoice.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/:id/download", downloadInvoice);
router.put("/:id/status", updateInvoiceStatus);
router.delete("/:id", deleteInvoice);

export default router;