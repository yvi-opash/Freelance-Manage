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
            <Clock className={`w-4 h-4 ${e.startTime ? 'text-orange-600 animate-pulse' : 'text-slate-400'}`} />
            <span className={`font-mono font-bold ${e.startTime ? 'text-orange-600' : 'text-slate-700'}`}>
                {e.startTime ? formatDuration(timerSeconds) : formatDuration(e.duration)}
            </span>
        </div>
      ) 
    },
  ];

  // Calculate Stats
  const todayDate = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const weekStartStr = thisWeekStart.toISOString().split('T')[0];

  let todaySeconds = 0;
  let weekSeconds = 0;
  let billableToday = 0;
  let runningCount = 0;

  (entries as TimeEntry[]).forEach(e => {
    let dur = e.duration || 0;
    if (e.startTime) {
       runningCount++;
       if (e._id === activeTimerId) {
          dur = timerSeconds;
       } else {
          const start = new Date(e.startTime).getTime();
          const now = new Date().getTime();
          dur += Math.floor((now - start) / 1000);
       }
    }
    
    if (e.date === todayDate) {
       todaySeconds += dur;
       const pid = typeof e.projectId === 'object' ? (e.projectId as any)._id : e.projectId;
       const p = projects.find(p => p._id === pid);
       if (p && p.hourRate) {
          billableToday += (dur / 3600) * p.hourRate;
       }
    }
    if (e.date >= weekStartStr) {
       weekSeconds += dur;
    }
  });

  const todayHrs = (todaySeconds / 3600).toFixed(2);
  const weekHrs = (weekSeconds / 3600).toFixed(2);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Time tracker</h1>
        <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Manual entry
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <p className="text-slate-500 text-sm mb-1 font-medium">Today</p>
          <h3 className="text-2xl font-bold text-slate-800">{todayHrs} hr</h3>
        </Card>
        <Card className="shadow-sm">
          <p className="text-slate-500 text-sm mb-1 font-medium">This week</p>
          <h3 className="text-2xl font-bold text-slate-800">{weekHrs} hr</h3>
        </Card>
        <Card className="shadow-sm">
          <p className="text-slate-500 text-sm mb-1 font-medium">Billable today</p>
          <h3 className="text-2xl font-bold text-emerald-600">${Math.round(billableToday)}</h3>
        </Card>
        <Card className="shadow-sm">
          <p className="text-slate-500 text-sm mb-1 font-medium">Running</p>
          <h3 className="text-2xl font-bold text-slate-800">{runningCount}</h3>
        </Card>
      </div>

      <Card title={<span className="text-xs tracking-wider text-slate-400 uppercase font-bold">Active Projects</span>}>
        <div className="flex flex-col gap-2 mt-4">
          {projects.map(project => {
             const activeEntry = (entries as TimeEntry[]).find(e => {
                const pid = typeof e.projectId === 'object' ? (e.projectId as any)._id : e.projectId;
                return e.startTime && pid === project._id;
             });
             const isActive = !!activeEntry;
             
             let displayTime = '00:00:00';
             if (isActive && activeEntry._id === activeTimerId) {
                displayTime = formatDuration(timerSeconds);
             } else if (isActive) {
                const start = new Date(activeEntry.startTime!).getTime();
                const now = new Date().getTime();
                displayTime = formatDuration(activeEntry.duration + Math.floor((now - start) / 1000));
             }

             return (
               <div key={project._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                      {project.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{project.name}</h3>
                      <p className="text-xs text-slate-500">
                        {project.clientId?.name || 'Unknown'} · {project.clientId?.currency || '$'}{project.hourRate}/hr
                      </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <span className={`font-mono text-lg ${isActive ? 'text-orange-600 font-bold animate-pulse' : 'text-slate-600'}`}>
                      {displayTime}
                    </span>
                    {isActive ? (
                      <Button variant="secondary" className="bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300" onClick={() => timerMutation.mutate({ action: 'stop', id: activeEntry._id })}>
                        <Square className="w-4 h-4 fill-current mr-1" /> Stop
                      </Button>
                    ) : (
                      <Button variant="secondary" className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50" onClick={() => timerMutation.mutate({ action: 'start', data: { projectId: project._id, description: 'Working' } })}>
                        <Play className="w-4 h-4 fill-current mr-1" /> Start
                      </Button>
                    )}
                 </div>
               </div>
             );
          })}
          {projects.length === 0 && (
             <p className="text-center text-slate-400 py-4">No active projects available.</p>
          )}
        </div>
      </Card>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Past Time Entries</h2>
        <Table 
          columns={columns} 
          data={entries} 
          isLoading={isEntriesLoading} 
          onDelete={(e) => setDeleteConfirm(e._id)}
          deletingId={deleteTimeMutation.isPending ? (deleteTimeMutation.variables as string) : undefined}
        />
      </div>

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
            <input {...register('description')} className="input-field" />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration (minutes)" error={errors.duration?.message}>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  {...register('duration', { valueAsNumber: true })} 
                  type="number" 
                  className="input-field pl-10" 
                 
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
