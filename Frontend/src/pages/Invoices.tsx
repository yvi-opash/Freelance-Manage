import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Plus, FileText, Download, Trash2, Calendar, Users, DollarSign, Percent } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import FormField from '../components/FormField';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import Card from '../components/Card';
import { Invoice, Client, Project, TimeEntry } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  projectId: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  tax: z.number().min(0),
  discount: z.number().min(0),
  currency: z.string().min(2),
  lineItems: z.array(z.object({
    description: z.string().min(1),
    amount: z.number().min(0),
  })).min(1, 'At least one item is required'),
});

type InvoiceForm = z.infer<typeof invoiceSchema>;

const Invoices = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const { data: invoices = [], isLoading: isInvoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/invoices`, { headers });
      return res.data;
    },
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/clients`, { headers });
      return res.data;
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors }, reset, setValue } = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      lineItems: [{ description: '', amount: 0 }],
      tax: 0,
      discount: 0,
      currency: 'USD',
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems"
  });

  const mutation = useMutation({
    mutationFn: async (data: InvoiceForm) => {
      return axios.post(`${API_URL}/invoices`, data, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsModalOpen(false);
      reset();
      setToast({ message: 'Invoice created successfully', type: 'success' });
    },
  });

  const handleDownload = async (id: string, number: string) => {
    try {
      const response = await axios.get(`${API_URL}/invoices/${id}/download`, {
        headers,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setToast({ message: 'Error downloading PDF', type: 'error' });
    }
  };

  const lineItems = watch('lineItems');
  const tax = watch('tax');
  const discount = watch('discount');
  const currency = watch('currency');
  
  const subtotal = lineItems?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;
  const total = subtotal + (subtotal * (tax || 0) / 100) - (subtotal * (discount || 0) / 100);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`${API_URL}/invoices/${id}`, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setToast({ message: 'Invoice deleted', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Error deleting invoice', type: 'error' });
    },
  });

  const columns = [
    { 
      header: 'Invoice', 
      accessor: (i: Invoice) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <div className="font-bold text-slate-800">{i.invoiceNumber}</div>
            <div className="text-xs text-slate-400">Created {new Date(i.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      ) 
    },
    { 
      header: 'Client', 
      accessor: (i: any) => {
        if (typeof i.clientId === 'object' && i.clientId?.name) return i.clientId.name;
        return clients.find(c => c._id === i.clientId)?.name || 'Unknown';
      }
    },
    { 
      header: 'Amount', 
      accessor: (i: Invoice) => (
        <span className="font-bold text-slate-700">{i.currency} {(i.totalAmount ?? 0).toLocaleString()}</span>
      ) 
    },
    { 
      header: 'Status', 
      accessor: (i: Invoice) => {
        const styles = {
          draft: 'bg-slate-50 text-slate-600',
          sent: 'bg-blue-50 text-blue-600',
          paid: 'bg-emerald-50 text-emerald-600',
          overdue: 'bg-rose-50 text-rose-600',
        };
        return (
          <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase border ${styles[i.status]}`}>
            {i.status}
          </span>
        );
      } 
    },
    {
      header: 'Download',
      accessor: (i: Invoice) => (
        <button 
            onClick={() => handleDownload(i._id, i.invoiceNumber)}
            className="p-2 hover:bg-slate-50 text-indigo-600 rounded-lg transition-colors"
        >
            <Download className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
          <p className="text-slate-500 text-sm">Generate branded invoices and track payment status.</p>
        </div>
        <Button onClick={() => { reset(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      <Table 
        columns={columns} 
        data={invoices} 
        isLoading={isInvoicesLoading} 
        onDelete={(i) => setDeleteConfirm(i._id)}
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
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Invoice"
      >
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Client" error={errors.clientId?.message}>
              <select {...register('clientId')} className="input-field">
                <option value="">Select Client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Invoice #" error={errors.invoiceNumber?.message}>
              <input {...register('invoiceNumber')} className="input-field" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Due Date" error={errors.dueDate?.message}>
              <input {...register('dueDate')} type="date" className="input-field" />
            </FormField>
            <FormField label="Currency" error={errors.currency?.message}>
              <select {...register('currency')} className="input-field">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </FormField>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Line Items</h3>
                <button 
                    type="button" 
                    onClick={() => append({ description: '', amount: 0 })}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                    + Add Item
                </button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    {...register(`lineItems.${index}.description` as const)}
                    placeholder="Description"
                    className="input-field py-1.5 text-sm"
                  />
                </div>
                <div className="w-32">
                  <input
                    {...register(`lineItems.${index}.amount` as const, { valueAsNumber: true })}
                    type="number"
                    placeholder="Amount"
                    className="input-field py-1.5 text-sm"
                  />
                </div>
                <button type="button" onClick={() => remove(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <Card className="bg-slate-50 border-none">
            <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-bold">{currency} {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex-1 flex gap-2 items-center">
                        <Percent className="w-3 h-3 text-slate-400" />
                        <input {...register('tax', { valueAsNumber: true })} type="number" className="bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none w-12 text-center" />
                        <span className="text-slate-400">Tax</span>
                    </div>
                    <div className="flex-1 flex gap-2 items-center justify-end">
                        <Percent className="w-3 h-3 text-slate-400" />
                        <input {...register('discount', { valueAsNumber: true })} type="number" className="bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none w-12 text-center" />
                        <span className="text-slate-400">Discount</span>
                    </div>
                </div>
                <hr className="my-2 border-slate-200" />
                <div className="flex justify-between text-lg font-extrabold text-slate-800">
                    <span>Total Due</span>
                    <span className="text-indigo-600">{currency} {total.toLocaleString()}</span>
                </div>
            </div>
          </Card>

          <Button type="submit" className="w-full" isLoading={mutation.isPending}>
            Generate Invoice
          </Button>
        </form>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Invoices;
