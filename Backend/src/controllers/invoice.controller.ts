import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as invoiceService from "../services/invoice.service";

export const createInvoice = async (req: AuthRequest, res: Response) => {
  const invoice = await invoiceService.createInvoice(
    req.user!.id,
    req.body
  );
  res.status(201).json(invoice);
};

export const getInvoices = async (req: AuthRequest, res: Response) => {
  const invoices = await invoiceService.getInvoices(req.user!.id);
  res.json(invoices);
};

export const updateInvoiceStatus = async (
  req: AuthRequest,
  res: Response
) => {
  const updated = await invoiceService.updateInvoice(
    req.user!.id,
    req.params.id as string,
    req.body.status
  );
  res.json(updated);
};