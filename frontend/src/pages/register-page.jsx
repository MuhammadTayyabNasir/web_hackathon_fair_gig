import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuthStore } from '../store/auth-store';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password min 6 chars'),
  role: z.enum(['worker', 'verifier', 'advocate']),
});

const roles = [
  { value: 'worker', label: 'Worker', desc: 'Delivery riders, drivers, freelancers' },
  { value: 'verifier', label: 'Verifier', desc: 'Review and verify shift screenshots' },
  { value: 'advocate', label: 'Advocate', desc: 'Analyze trends and escalate issues' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'worker' },
  });

  const selectedRole = watch('role');

  async function onSubmit(data) {
    setLoading(true);
    try {
      const res = await api.post('/api/v1/auth/register', data);
      // Auto-login after register
      const loginRes = await api.post('/api/v1/auth/login', { email: data.email, password: data.password });
      setSession(loginRes.data.data);
      toast.success('Welcome to FairGig!');
      const role = loginRes.data.data.user.role;
      navigate(role === 'worker' ? '/worker/dashboard' : role === 'verifier' ? '/verifier/queue' : '/advocate/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-3xl font-black text-blue-800">Fair<span className="text-green-600">Gig</span></Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Already have an account? <Link to="/login" className="text-blue-700 hover:underline">Log in</Link></p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Role selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">I am a...</label>
            <div className="grid gap-3">
              {roles.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-colors ${
                    selectedRole === r.value ? 'border-blue-800 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input type="radio" className="mt-0.5" value={r.value} {...register('role')} />
                  <div>
                    <div className="font-semibold text-slate-900">{r.label}</div>
                    <div className="text-xs text-slate-500">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <input {...register('name')} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="Ali Khan" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input {...register('email')} type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="ali@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input {...register('password')} type="password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
