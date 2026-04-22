import Expense from "../model/expence.model";

export const createExpenses = async (userId : string , data: any) => {
    return Expense.create({...data, userId});
};

export const getExpenses = async (userId: string) => {
    return Expense.find({ userId }).populate("projectId");
};

export const deleteExpenses = async (userId: string, id: string) => {
    return Expense.findOneAndDelete({ _id: id, userId });
}