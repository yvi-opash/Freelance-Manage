import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Plus, User, Mail, Building, MapPin, Globe } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import FormField from '../components/FormField';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { Client } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const clientSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  company: z.string().min(2, 'Company is required'),
  billingAddress: z.string().min(5, 'Address is required'),
  currency: z.string().min(2, 'Currency is required'),
  notes: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

const Clients = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/clients`, { headers });
      return res.data;
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ClientForm) => {
      if (editingClient) {
        return axios.put(`${API_URL}/clients/${editingClient._id}`, data, { headers });
      }
      return axios.post(`${API_URL}/clients`, data, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsModalOpen(false);
      reset();
      setEditingClient(null);
      setToast({ message: `Client ${editingClient ? 'updated' : 'added'} successfully`, type: 'success' });
    },
    onError: (error: any) => {
      setToast({ message: error.response?.data?.message || 'Error saving client', type: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`${API_URL}/clients/${id}`, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setToast({ message: 'Client deleted successfully', type: 'success' });
    },
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setValue('name', client.name);
    setValue('email', client.email);
    setValue('company', client.company);
    setValue('billingAddress', client.billingAddress);
    setValue('currency', client.currency);
    setValue('notes', client.notes || '');
    setIsModalOpen(true);
  };

  const onSubmit = (data: ClientForm) => mutation.mutate(data);

  const columns = [
    { 
      header: 'Client Name', 
      accessor: (c: Client) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
            {c.name[0]}
          </div>
          <span className="font-bold text-slate-800">{c.name}</span>
        </div>
      ) 
    },
    { header: 'Company', accessor: 'company' as keyof Client },
    { header: 'Email', accessor: 'email' as keyof Client },
    { 
        header: 'Currency', 
        accessor: (c: Client) => <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase">{c.currency}</span> 
    },
    {
        header: 'Notes',
        accessor: (c: Client) => <span className="text-xs text-slate-400 line-clamp-1 max-w-[150px]" title={c.notes}>{c.notes || '-'}</span>
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
          <p className="text-slate-500 text-sm">Manage your client directory and billing info.</p>
        </div>
        <Button onClick={() => { setEditingClient(null); reset(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      <Table 
        columns={columns} 
        data={clients} 
        isLoading={isLoading} 
        onEdit={handleEdit}
        onDelete={(c) => setDeleteConfirm(c._id)}
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
        title="Delete Client"
        message="Are you sure you want to delete this client? This will also remove all their projects and data."
        isLoading={deleteMutation.isPending}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingClient ? 'Edit Client' : 'Add New Client'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Full Name" error={errors.name?.message}>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input {...register('name')} className="input-field pl-10" />
            </div>
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input {...register('email')} className="input-field pl-10" />
            </div>
          </FormField>

          <FormField label="Company Name" error={errors.company?.message}>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input {...register('company')} className="input-field pl-10" />
            </div>
          </FormField>

          <FormField label="Billing Address" error={errors.billingAddress?.message}>
            <div className="relative">
              <MapPin className="absolute left-3 top-4 w-5 h-5 text-slate-400" />
              <textarea {...register('billingAddress')} className="input-field pl-10 min-h-[100px]" />
            </div>
          </FormField>

          <FormField label="Default Currency" error={errors.currency?.message}>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select {...register('currency')} className="input-field pl-10">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>
          </FormField>

          <FormField label="Internal Notes (Optional)" error={errors.notes?.message}>
            <textarea {...register('notes')} className="input-field min-h-[80px]" />
          </FormField>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
              {editingClient ? 'Update Client' : 'Save Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Clients;
