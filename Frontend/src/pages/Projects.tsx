import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Plus, Briefcase, DollarSign, Tag, Users } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import FormField from '../components/FormField';
import Toast from '../components/Toast';
import { Project, Client } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const projectSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  name: z.string().min(2, 'Project name is required'),
  description: z.string().min(5, 'Description is required'),
  hourRate: z.number().min(0, 'Hourly rate must be positive'),
  status: z.enum(['active', 'completed', 'archived']),
});

type ProjectForm = z.infer<typeof projectSchema>;

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects`, { headers });
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

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: 'active', hourRate: 0 }
  });

  const mutation = useMutation({
    mutationFn: async (data: ProjectForm) => {
      if (editingProject) {
        return axios.put(`${API_URL}/projects/${editingProject._id}`, data, { headers });
      }
      return axios.post(`${API_URL}/projects`, data, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      reset();
      setEditingProject(null);
      setToast({ message: `Project ${editingProject ? 'updated' : 'created'} successfully`, type: 'success' });
    },
    onError: (error: any) => {
      setToast({ message: error.response?.data?.message || 'Error saving project', type: 'error' });
    },
  });

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setValue('clientId', project.clientId);
    setValue('name', project.name);
    setValue('description', project.description);
    setValue('hourRate', project.hourRate);
    setValue('status', project.status);
    setIsModalOpen(true);
  };

  const onSubmit = (data: ProjectForm) => mutation.mutate(data);

  const getClientName = (id: string) => clients.find(c => c._id === id)?.name || 'Unknown';

  const columns = [
    { 
      header: 'Project Name', 
      accessor: (p: Project) => (
        <div>
          <div className="font-bold text-slate-800">{p.name}</div>
          <div className="text-xs text-slate-400 truncate max-w-xs">{p.description}</div>
        </div>
      ) 
    },
    { 
      header: 'Client', 
      accessor: (p: Project) => (
        <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-slate-400" />
            <span>{getClientName(p.clientId)}</span>
        </div>
      ) 
    },
    { 
      header: 'Rate', 
      accessor: (p: Project) => <span className="font-semibold text-slate-700">${p.hourRate}/hr</span> 
    },
    { 
      header: 'Status', 
      accessor: (p: Project) => {
        const styles = {
          active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          completed: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          archived: 'bg-slate-50 text-slate-600 border-slate-100',
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[p.status]}`}>
            {p.status.toUpperCase()}
          </span>
        );
      } 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-500 text-sm">Assign rates and track status for your client work.</p>
        </div>
        <Button onClick={() => { setEditingProject(null); reset(); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      <Table 
        columns={columns} 
        data={projects} 
        isLoading={isProjectsLoading} 
        onEdit={handleEdit}
        onDelete={(p) => { if(confirm('Archive project?')) mutation.mutate({ ...p, status: 'archived' }); }}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProject ? 'Edit Project' : 'New Project'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Assign Client" error={errors.clientId?.message}>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select {...register('clientId')} className="input-field pl-10" disabled={!!editingProject}>
                <option value="">Select a client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </FormField>

          <FormField label="Project Name" error={errors.name?.message}>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input {...register('name')} className="input-field pl-10" placeholder="Website Redesign" />
            </div>
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <div className="relative">
              <Tag className="absolute left-3 top-4 w-5 h-5 text-slate-400" />
              <textarea {...register('description')} className="input-field pl-10 min-h-[80px]" placeholder="Project scope and details..." />
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Hourly Rate ($)" error={errors.hourRate?.message}>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  {...register('hourRate', { valueAsNumber: true })} 
                  type="number" 
                  step="0.01" 
                  className="input-field pl-10" 
                />
              </div>
            </FormField>

            <FormField label="Status" error={errors.status?.message}>
              <select {...register('status')} className="input-field">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </FormField>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
              {editingProject ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Projects;
