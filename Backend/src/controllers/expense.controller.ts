import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {createExpenses, getExpenses, deleteExpenses} from "../services/expence.service";


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