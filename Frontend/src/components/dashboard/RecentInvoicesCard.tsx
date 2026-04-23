import React from 'react';
import Card from '../Card';
import { DashboardStats } from '../../types';

interface Props {
  stats: DashboardStats | undefined;
}

const RecentInvoicesCard: React.FC<Props> = ({ stats }) => {
  return (
    <Card title="Recent Invoices">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-medium">Client</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {stats?.recentInvoices?.map((invoice, idx) => {
              const currency = invoice.clientId?.currency || '$';
              const clientName = invoice.clientId?.name || 'Unknown';
              const statusStyles = {
                draft: 'bg-slate-100 text-slate-600',
                sent: 'bg-blue-50 text-blue-600',
                paid: 'bg-emerald-50 text-emerald-600',
                overdue: 'bg-rose-50 text-rose-600',
              };
              return (
                <tr key={idx} className="group">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs">
                        {clientName[0]}
                      </div>
                      <span className="font-bold text-slate-700">{clientName}</span>
                    </div>
                  </td>
                  <td className="py-4 font-bold text-slate-800">
                    {currency} {(invoice.totalAmount ?? 0).toLocaleString()}
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusStyles[invoice.status as keyof typeof statusStyles]}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {(!stats?.recentInvoices || stats?.recentInvoices.length === 0) && (
              <tr>
                <td colSpan={3} className="text-center text-slate-400 py-8">
                  No recent invoices.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentInvoicesCard;
