import React from 'react';
import Card from '../Card';
import { DashboardStats } from '../../types';

interface Props {
  stats: DashboardStats | undefined;
}

const RecentExpensesCard: React.FC<Props> = ({ stats }) => {
  return (
    <Card title="Recent Expenses">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-medium">Description</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {stats?.recentExpenses?.map((expense, idx) => {
              const currency = expense.projectId?.clientId?.currency || '';
              const categoryStyles: Record<string, string> = {
                'Software': 'bg-blue-50 text-blue-600',
                'Infra': 'bg-slate-100 text-slate-600',
                'Meals': 'bg-emerald-50 text-emerald-600',
                'Travel': 'bg-orange-50 text-orange-600',
                'Hardware': 'bg-purple-50 text-purple-600',
                'Marketing': 'bg-pink-50 text-pink-600',
                'Office': 'bg-teal-50 text-teal-600',
              };
              const catStyle = categoryStyles[expense.category] || 'bg-slate-50 text-slate-600';
              
              return (
                <tr key={idx} className="group">
                  <td className="py-4">
                    <span className="font-bold text-slate-700">{expense.description}</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${catStyle}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-slate-800">
                    {currency} {expense.amount.toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {(!stats?.recentExpenses || stats?.recentExpenses.length === 0) && (
              <tr>
                <td colSpan={3} className="text-center text-slate-400 py-8">
                  No recent expenses.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentExpensesCard;
