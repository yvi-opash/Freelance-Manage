import mongoose from "mongoose";
import Invoice from "../model/invoice.model";
import Expense from "../model/expence.model";
import TimeEntry from "../model/timeentry.model";

export const getDashboard = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const outstanding = await Invoice.aggregate([
    { $match: { userId: userObjectId, status: { $ne: "paid" } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  const paid = await Invoice.aggregate([
    {
      $match: {
        userId: userObjectId,
        status: "paid",
        createdAt: {
          $gte: new Date(new Date().setDate(1)),
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  const expenses = await Expense.aggregate([
    { $match: { userId: userObjectId } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const activeTimers = await TimeEntry.find({ 
    userId: userObjectId, 
    startTime: { $exists: true, $ne: null } 
  }).populate("projectId");

  const recentInvoices = await Invoice.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .limit(4)
    .populate("clientId");

  const recentExpenses = await Expense.find({ userId: userObjectId })
    .sort({ date: -1 })
    .limit(4)
    .populate("projectId");

  return {
    outstanding: outstanding[0]?.total || 0,
    paidThisMonth: paid[0]?.total || 0,
    totalExpenses: expenses[0]?.total || 0,
    activeTimers: activeTimers || [],
    recentInvoices: recentInvoices || [],
    recentExpenses: recentExpenses || [],
  };
};