import React from 'react';
import Card from '../Card';
import { Clock } from 'lucide-react';
import { DashboardStats } from '../../types';

interface Props {
  stats: DashboardStats | undefined;
}

const ActiveTimersCard: React.FC<Props> = ({ stats }) => {
  return (
    <Card title="Active Timers">
      <div className="space-y-4">
        {stats?.activeTimers?.map((timer, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl transition-hover hover:scale-[1.02] duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-slate-700 block">{timer.description || "Running Timer..."}</span>
                <span className="text-xs text-slate-500">{timer.projectId?.name || "Unknown Project"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <span className="relative flex h-2.5 w-2.5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
               </span>
               <span className="font-bold text-emerald-600 text-sm tracking-wide uppercase">Active</span>
            </div>
          </div>
        ))}
        {(!stats?.activeTimers || stats?.activeTimers.length === 0) && (
          <div className="text-center text-slate-400 py-8 flex flex-col items-center gap-2">
            <Clock className="w-8 h-8 text-slate-300" />
            <p>No active timers.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActiveTimersCard;
