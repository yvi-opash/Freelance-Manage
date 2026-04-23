import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as invoiceService from "../services/invoice.service";

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await invoiceService.createInvoice(
      req.user!.id,
      req.body
    );
    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await invoiceService.getInvoices(req.user!.id);
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
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
export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    await invoiceService.deleteInvoice(req.user!.id, req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
    await invoiceService.generateInvoicePDF(req.user!.id, id as string, res);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
