import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Plus, Banknote, Coins, Tag, Calendar, Image as ImageIcon, Briefcase, Download } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import FormField from '../components/FormField';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { Expense, Project } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const expenseSchema = z.object({
  projectId: z.string().optional(),
  amount: z.number().min(0.01, 'Amount is required'),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(2, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  receipt: z.string().optional(),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

const Expenses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const { data: expenses = [], isLoading: isExpensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/expenses`, { headers });
      return res.data;
    },
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects`, { headers });
      return res.data;
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { date: new Date().toISOString().split('T')[0] }
  });

  const mutation = useMutation({
    mutationFn: async (data: ExpenseForm) => {
      if (editingExpense) {
        return axios.put(`${API_URL}/expenses/${editingExpense._id}`, data, { headers });
      }
      return axios.post(`${API_URL}/expenses`, data, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsModalOpen(false);
      reset();
      setToast({ message: `Expense ${editingExpense ? 'updated' : 'added'} successfully`, type: 'success' });
    },
  });

  const handleDownloadReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses/download`, {
        headers,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expense-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setToast({ message: 'Error downloading report', type: 'error' });
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setValue('projectId', expense.projectId);
    setValue('amount', expense.amount);
    setValue('category', expense.category);
    setValue('description', expense.description);
    setValue('date', expense.date ? new Date(expense.date).toISOString().split('T')[0] : '');
    setIsModalOpen(true);
  };

  const getProjectName = (id: any) => {
    if (typeof id === 'object' && id?._id) return id.name;
    return id ? projects.find(p => p._id === id)?.name : 'General';
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`${API_URL}/expenses/${id}`, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setToast({ message: 'Expense deleted', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Error deleting expense', type: 'error' });
    },
  });

  const columns = [
    { 
      header: 'Expense', 
      accessor: (e: Expense) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <Banknote className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-800">{e.description}</div>
            <div className="text-xs text-slate-400">{e.category}</div>
          </div>
        </div>
      ) 
    },
    { 
        header: 'Project', 
        accessor: (e: Expense) => (
          <div className="flex items-center gap-2">
              <Briefcase className="w-3 h-3 text-slate-400" />
              <span className="text-sm">{getProjectName(e.projectId)}</span>
          </div>
        ) 
    },
    { 
      header: 'Amount', 
      accessor: (e: any) => {
        const currency = e.projectId?.clientId?.currency || '';
        return <span className="font-bold text-slate-800">{currency} {e.amount.toLocaleString()}</span>;
      }
    },
    { 
        header: 'Date', 
        accessor: (e: Expense) => (
          <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span className="text-sm">{new Date(e.date).toLocaleDateString()}</span>
          </div>
        ) 
    },
  ];

  const categories = ['Software', 'Travel', 'Meals', 'Hardware', 'Marketing', 'Office', 'Misc'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
          <p className="text-slate-500 text-sm">Track your overheads and project-linked costs.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleDownloadReport}>
            <Download className="w-4 h-4" />
            Download Report
          </Button>
          <Button onClick={() => { setEditingExpense(null); reset(); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            Log Expense
          </Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={expenses} 
        isLoading={isExpensesLoading} 
        onEdit={handleEdit}
        onDelete={(e) => setDeleteConfirm(e._id)}
        deletingId={deleteMutation.isPending ? (deleteMutation.variables as string) : undefined}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteMutation.mutate(deleteConfirm, {
              onSuccess: () => setDeleteConfirm(null)
            });
          }
        }}
        title="Delete Expense"
        message="Are you sure you want to delete this expense entry?"
        isLoading={deleteMutation.isPending}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingExpense ? 'Edit Expense' : 'Log New Expense'}
      >
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount" error={errors.amount?.message}>
                <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input {...register('amount', { valueAsNumber: true })} type="number" step="0.01" className="input-field pl-10" />
                </div>
            </FormField>
            <FormField label="Date" error={errors.date?.message}>
                <input {...register('date')} type="date" className="input-field" />
            </FormField>
          </div>

          <FormField label="Category" error={errors.category?.message}>
            <select {...register('category')} className="input-field">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>

          <FormField label="Project (Optional)" error={errors.projectId?.message}>
            <select {...register('projectId')} className="input-field">
                <option value="">None (Business Expense)</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input {...register('description')} className="input-field pl-10" />
            </div>
          </FormField>

          <FormField label="Receipt URL (Optional)" error={errors.receipt?.message}>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input {...register('receipt')} className="input-field pl-10" />
            </div>
          </FormField>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
              {editingExpense ? 'Update Expense' : 'Log Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Expenses;
