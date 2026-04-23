import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {createExpenses, getExpenses, deleteExpenses, updateExpenses, generateExpenseReportPDF} from "../services/expence.service";


export const createExpense = async (req: AuthRequest, res: Response) => {
    try {
        const expense = await createExpenses(
            req.user!.id,
            req.body
        )
        res.status(201).json(expense);

    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
};

export const getExpense = async (req: AuthRequest, res: Response) => {
    const expenses = await getExpenses(
        req.user!.id,
    );
    res.json(expenses);
}

export const deleteExpense = async (req: AuthRequest, res: Response) => {
    await deleteExpenses(
        req.user!.id,
        req.params.id as string
    ) 
    res.json({ message: "Expense deleted" });
}
export const updateExpense = async (req: AuthRequest, res: Response) => {
    try {
        const updated = await updateExpenses(req.user!.id, req.params.id as string, req.body);
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const downloadExpenses = async (req: AuthRequest, res: Response) => {
    try {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=expense-report.pdf');
        await generateExpenseReportPDF(req.user!.id, res);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
