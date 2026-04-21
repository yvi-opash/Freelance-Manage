import Expense from "../model/expence.model";

export const createExpense = async (userId : string , data: any) => {
    return Expense.create({...data, userId});
};

export const getExpenses = async (userId: string) => {
    return Expense.find({ userId }).populate("projectId");
};

export const deleteExpense = async (userId: string, id: string) => {
    return Expense.findOneAndDelete({ _id: id, userId });
}