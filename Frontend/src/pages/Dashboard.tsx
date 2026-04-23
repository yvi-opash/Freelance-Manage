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
    { name: 'New Project', icon: Briefcase, path: '/projects', color: 'bg-indigo-500' },
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

      {/* Stats Grid */}
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

        <Card className="border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold text-slate-800">{(stats?.totalExpenses ?? 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Wallet className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Clients */}
        <Card title="Top Clients by Revenue">
          <div className="space-y-4">
            {stats?.topClients?.map((client, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl transition-hover hover:scale-[1.02] duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-indigo-600 border border-slate-100 shadow-sm">
                    {client.name[0]}
                  </div>
                  <span className="font-bold text-slate-700">{client.name}</span>
                </div>
                <span className="font-bold text-indigo-600">{client.currency} {(client.revenue ?? 0).toLocaleString()}</span>
              </div>
            ))}
            {(!stats?.topClients || stats?.topClients.length === 0) && (
              <p className="text-center text-slate-400 py-8">No revenue data available yet.</p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.name} to={action.path}>
              <Card className="h-full hover:border-indigo-200 hover:shadow-indigo-100/50 transition-all group">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`p-4 ${action.color} rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-700">{action.name}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
