import Invoice from "../model/invoice.model";
import Expense from "../model/expence.model";

export const getDashboard = async (userId: string) => {
  const outstanding = await Invoice.aggregate([
    { $match: { userId: userId, status: { $ne: "paid" } } },
    { $group: { _id: null, total: { $sum: "$totalamount" } } },
  ]);

  const paid = await Invoice.aggregate([
    {
      $match: {
        userId: userId,
        status: "paid",
        createdAt: {
          $gte: new Date(new Date().setDate(1)),
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$totalamount" } } },
  ]);

  const expenses = await Expense.aggregate([
    { $match: { userId: userId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return {
    outstanding: outstanding[0]?.total || 0,
    paidThisMonth: paid[0]?.total || 0,
    expenses: expenses[0]?.total || 0,
  };
};