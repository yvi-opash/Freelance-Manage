import React from 'react';
import Card from '../Card';
import { AlertCircle, TrendingUp, Wallet } from 'lucide-react';
import { DashboardStats } from '../../types';

interface Props {
  stats: DashboardStats | undefined;
}

const DashboardSummaryStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Outstanding</p>
            <h3 className="text-2xl font-bold text-slate-800">{(stats?.outstanding ?? 0).toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </Card>

      <Card className="border-l-4 border-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Paid this Month</p>
            <h3 className="text-2xl font-bold text-slate-800">{(stats?.paidThisMonth ?? 0).toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </Card>

      <Card className="border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Expenses</p>
            <h3 className="text-2xl font-bold text-slate-800">{(stats?.totalExpenses ?? 0).toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl">
            <Wallet className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardSummaryStats;
