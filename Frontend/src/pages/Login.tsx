import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Lock, Mail, User as UserIcon } from 'lucide-react';
import Button from '../components/Button';
import FormField from '../components/FormField';
import Toast from '../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

type AuthForm = z.infer<typeof authSchema>;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: data.email,
          password: data.password,
        });
        localStorage.setItem('token', response.data.token);
        navigate('/');
      } else {
        await axios.post(`${API_URL}/auth/register`, data);
        setToast({ message: 'Account created! Please login.', type: 'success' });
        setIsLogin(true);
        reset();
      }
    } catch (error: any) {
      setToast({ 
        message: error.response?.data?.message || 'Something went wrong', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200 mb-4 animate-bounce">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">Freelance</h1>
          <p className="text-slate-500 mt-2">Manage your freelance business with ease</p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${
                isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${
                !isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            {!isLogin && (
              <FormField label="Full Name" error={errors.name?.message}>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    {...register('name')}
                    type="text"
                    className="input-field pl-10"
                    placeholder="John Doe"
                  />
                </div>
              </FormField>
            )}

            <FormField label="Email Address" error={errors.email?.message}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="input-field pl-10"
                  placeholder="name@company.com"
                />
              </div>
            </FormField>

            <FormField label="Password" error={errors.password?.message}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('password')}
                  type="password"
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </FormField>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
           Freelance Manager. All rights reserved.
        </p>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default Login;
