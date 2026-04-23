export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  company: string;
  billingAddress: string;
  currency: string;
  notes?: string;
}

export interface Project {
  _id: string;
  clientId: string;
  name: string;
  description: string;
  hourRate: number;
  status: 'active' | 'completed' | 'archived';
}

export interface TimeEntry {
  _id: string;
  projectId: string;
  description: string;
  duration: number; // in seconds
  date: string;
  startTime?: string; // if running
}

export interface LineItem {
  description: string;
  amount: number;
}

export interface Invoice {
  _id: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  lineItems: LineItem[];
  totalAmount: number;
  tax: number;
  discount: number;
  currency: string;
  fxRate: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

export interface Expense {
  _id: string;
  projectId?: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  receipt?: string;
}

export interface DashboardStats {
  outstanding: number;
  paidThisMonth: number;
  totalExpenses: number;
  activeTimers: any[];
  recentInvoices: any[];
  recentExpenses: any[];
}
