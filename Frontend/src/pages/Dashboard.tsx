import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  TrendingUp, 
  Clock, 
  Wallet, 
  AlertCircle,
  Briefcase,
  Users,
  FileText,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { DashboardStats } from '../types';

import DashboardSummaryStats from '../components/dashboard/DashboardSummaryStats';
import ActiveTimersCard from '../components/dashboard/ActiveTimersCard';
import QuickActionsCard from '../components/dashboard/QuickActionsCard';
import RecentInvoicesCard from '../components/dashboard/RecentInvoicesCard';
import RecentExpensesCard from '../components/dashboard/RecentExpensesCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-rose-500">Error loading dashboard stats</div>;

  const quickActions = [
    { name: 'Add Client', icon: Users, path: '/clients', color: 'bg-blue-500' },
    { name: 'New Project', icon: Briefcase, path: '/projects', color: 'bg-orange-500' },
    { name: 'Track Time', icon: Clock, path: '/time-entries', color: 'bg-emerald-500' },
    { name: 'Create Invoice', icon: FileText, path: '/invoices', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex gap-2">
            <Link to="/invoices">
                <button className="btn-primary">
                    <Plus className="w-4 h-4" />
                    New Invoice
                </button>
            </Link>
        </div>
      </div>

      <DashboardSummaryStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActiveTimersCard stats={stats} />
        <QuickActionsCard actions={quickActions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentInvoicesCard stats={stats} />
        <RecentExpensesCard stats={stats} />
      </div>
    </div>
  );
};

export default Dashboard;
