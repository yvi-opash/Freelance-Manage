import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Plus, Receipt, DollarSign, Tag, Calendar, Image as ImageIcon, Briefcase } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import FormField from '../components/FormField';
import Toast from '../components/Toast';
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

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setValue('projectId', expense.projectId);
    setValue('amount', expense.amount);
    setValue('category', expense.category);
    setValue('description', expense.description);
    setValue('date', expense.date ? new Date(expense.date).toISOString().split('T')[0] : '');
    setIsModalOpen(true);
  };

  const getProjectName = (id?: string) => id ? projects.find(p => p._id === id)?.name : 'General';

  const columns = [
    { 
      header: 'Expense', 
      accessor: (e: Expense) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Receipt className="w-4 h-4" />
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
      accessor: (e: Expense) => <span className="font-bold text-slate-800">${e.amount.toLocaleString()}</span> 
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
        <Button onClick={() => { setEditingExpense(null); reset(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Log Expense
        </Button>
      </div>

      <Table 
        columns={columns} 
        data={expenses} 
        isLoading={isExpensesLoading} 
        onEdit={handleEdit}
        onDelete={(e) => { if(confirm('Delete expense?')) axios.delete(`${API_URL}/expenses/${e._id}`, { headers }).then(() => queryClient.invalidateQueries({ queryKey: ['expenses'] })); }}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingExpense ? 'Edit Expense' : 'Log New Expense'}
      >
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount ($)" error={errors.amount?.message}>
                <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
              <input {...register('description')} className="input-field pl-10" placeholder="Hosting fees, hardware, etc." />
            </div>
          </FormField>

          <FormField label="Receipt URL (Optional)" error={errors.receipt?.message}>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input {...register('receipt')} className="input-field pl-10" placeholder="https://..." />
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
