import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Plus, Clock, Briefcase, Play, Square, Timer, Calendar } from 'lucide-react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import FormField from '../components/FormField';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import Card from '../components/Card';
import { TimeEntry, Project } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const timeSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  description: z.string().min(2, 'Description is required'),
  duration: z.number().min(0).optional(),
  date: z.string().min(1, 'Date is required'),
});

type TimeForm = z.infer<typeof timeSchema>;

const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TimeEntries = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const { data: entries = [], isLoading: isEntriesLoading } = useQuery({
    queryKey: ['time-entries'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/time`, { headers });
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

  // Check for active timer on load
  useEffect(() => {
    const running = (entries as TimeEntry[]).find(e => e.startTime);
    if (running) {
      setActiveTimerId(running._id);
      const start = new Date(running.startTime!).getTime();
      const now = new Date().getTime();
      setTimerSeconds(running.duration + Math.floor((now - start) / 1000));
    } else {
      setActiveTimerId(null);
      setTimerSeconds(0);
    }
  }, [entries]);

  // Timer Tick
  useEffect(() => {
    let interval: any;
    if (activeTimerId) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerId]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TimeForm>({
    resolver: zodResolver(timeSchema),
    defaultValues: { date: new Date().toISOString().split('T')[0], duration: 0 }
  });

  const mutation = useMutation({
    mutationFn: async (data: TimeForm) => {
      return axios.post(`${API_URL}/time`, data, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      setIsModalOpen(false);
      reset();
      setToast({ message: 'Time entry logged successfully', type: 'success' });
    },
  });

  const timerMutation = useMutation({
    mutationFn: async ({ action, id, data }: { action: 'start' | 'stop', id?: string, data?: any }) => {
      if (action === 'start') {
        return axios.post(`${API_URL}/time/start`, data, { headers });
      }
      return axios.post(`${API_URL}/time/${id}/stop`, {}, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      setToast({ message: `Timer ${activeTimerId ? 'stopped' : 'started'}`, type: 'success' });
    },
  });

  const deleteTimeMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`${API_URL}/time/${id}`, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      setToast({ message: 'Time log deleted', type: 'success' });
    },
    onError: () => {
      setToast({ message: 'Error deleting log', type: 'error' });
    },
  });

  const getProjectName = (id: any) => {
    if (typeof id === 'object' && id?._id) return id.name;
    return projects.find(p => p._id === id)?.name || 'Unknown';
  };

  const columns = [
    { 
      header: 'Date', 
      accessor: (e: TimeEntry) => (
        <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{new Date(e.date).toLocaleDateString()}</span>
        </div>
      ) 
    },
    { 
      header: 'Project', 
      accessor: (e: TimeEntry) => (
        <span className="font-bold text-slate-700">{getProjectName(e.projectId)}</span>
      ) 
    },
    { header: 'Description', accessor: 'description' as keyof TimeEntry },
    { 
      header: 'Duration', 
      accessor: (e: TimeEntry) => (
        <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${e.startTime ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
            <span className={`font-mono font-bold ${e.startTime ? 'text-indigo-600' : 'text-slate-700'}`}>
                {e.startTime ? formatDuration(timerSeconds) : formatDuration(e.duration)}
            </span>
        </div>
      ) 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Time Tracking</h1>
          <p className="text-slate-500 text-sm">Log your billable hours manually or use the timer.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Manual Entry
            </Button>
        </div>
      </div>

      {/* Active Timer Card */}
      {activeTimerId && (
        <Card className="bg-indigo-600 text-white border-none shadow-indigo-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/20 rounded-2xl animate-pulse">
                        <Timer className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-indigo-100 text-sm font-medium">Currently Tracking</p>
                        <h2 className="text-xl font-bold">{getProjectName(entries.find((e: any) => e._id === activeTimerId)?.projectId)}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-4xl font-mono font-bold tracking-wider">
                        {formatDuration(timerSeconds)}
                    </div>
                    <button 
                        onClick={() => timerMutation.mutate({ action: 'stop', id: activeTimerId })}
                        className="p-4 bg-white text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                        <Square className="w-6 h-6 fill-current" />
                    </button>
                </div>
            </div>
        </Card>
      )}

      {!activeTimerId && (
        <Card className="bg-white border-dashed border-2 border-slate-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <Play className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-700">Start a new timer</span>
                        <p className="text-slate-400 text-xs">Pick a project and start work</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select id="timer-project" className="input-field py-2 text-sm md:w-48">
                        <option value="">Select Project</option>
                        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    <Button 
                        onClick={() => {
                            const pid = (document.getElementById('timer-project') as HTMLSelectElement).value;
                            if (pid) timerMutation.mutate({ action: 'start', data: { projectId: pid, description: 'Working on project' } });
                            else alert('Select a project first');
                        }}
                        isLoading={timerMutation.isPending}
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Start
                    </Button>
                </div>
            </div>
        </Card>
      )}

      <Table 
        columns={columns} 
        data={entries} 
        isLoading={isEntriesLoading} 
        onDelete={(e) => setDeleteConfirm(e._id)}
        deletingId={deleteTimeMutation.isPending ? (deleteTimeMutation.variables as string) : undefined}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteTimeMutation.mutate(deleteConfirm, {
              onSuccess: () => setDeleteConfirm(null)
            });
          }
        }}
        title="Delete Time Entry"
        message="Are you sure you want to delete this time log?"
        isLoading={deleteTimeMutation.isPending}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Log Time Manually"
      >
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <FormField label="Assign Project" error={errors.projectId?.message}>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select {...register('projectId')} className="input-field pl-10">
                <option value="">Select a project</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <input {...register('description')} className="input-field" placeholder="What were you working on?" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration (minutes)" error={errors.duration?.message}>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  {...register('duration', { valueAsNumber: true })} 
                  type="number" 
                  className="input-field pl-10" 
                  placeholder="60"
                />
              </div>
            </FormField>

            <FormField label="Date" error={errors.date?.message}>
              <input {...register('date')} type="date" className="input-field" />
            </FormField>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
              Log Time
            </Button>
          </div>
        </form>
      </Modal>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TimeEntries;
