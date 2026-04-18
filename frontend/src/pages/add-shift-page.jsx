import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/client';

const schema = z.object({
  platform_id: z.string().min(1, 'Platform required'),
  work_date: z.string().min(1, 'Date required'),
  shift_start: z.string().optional(),
  shift_end: z.string().optional(),
  hours_worked: z.coerce.number().positive('Hours must be > 0'),
  gross_earned: z.coerce.number().positive('Gross must be > 0'),
  platform_deductions: z.coerce.number().min(0, 'Deductions must be >= 0'),
});

export default function AddShiftPage() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      work_date: new Date().toISOString().slice(0, 10),
      hours_worked: '8',
      gross_earned: '',
      platform_deductions: '',
    },
  });

  const gross = watch('gross_earned');
  const deductions = watch('platform_deductions');
  const net = Math.max(0, Number(gross) - Number(deductions));
  const commissionPct = gross > 0 ? ((deductions / gross) * 100).toFixed(1) : '0.0';

  useEffect(() => {
    api.get('/api/v1/earnings/platforms').then(r => {
      setPlatforms(r.data.data.platforms || []);
    }).catch(() => toast.error('Could not load platforms'))
      .finally(() => setLoadingPlatforms(false));
  }, []);

  async function onSubmit(data) {
    try {
      const net_received = Number(data.gross_earned) - Number(data.platform_deductions);
      await api.post('/api/v1/earnings/shifts', { ...data, net_received });
      toast.success('Shift added!');
      navigate('/worker/shifts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add shift');
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Add Shift</h1>
          <Link to="/worker/shifts" className="text-sm text-slate-500 hover:underline">← Back</Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Platform</label>
              <select {...register('platform_id')} disabled={loadingPlatforms} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none">
                <option value="">Select platform...</option>
                {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.platform_id && <p className="mt-1 text-xs text-red-600">{errors.platform_id.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Work Date</label>
              <input {...register('work_date')} type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none" />
              {errors.work_date && <p className="mt-1 text-xs text-red-600">{errors.work_date.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Shift Start</label>
              <input {...register('shift_start')} type="time" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Shift End</label>
              <input {...register('shift_end')} type="time" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Hours Worked</label>
            <input {...register('hours_worked')} type="number" step="0.1" min="0" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none" />
            {errors.hours_worked && <p className="mt-1 text-xs text-red-600">{errors.hours_worked.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Gross Earned (PKR)</label>
              <input {...register('gross_earned')} type="number" step="0.01" min="0" placeholder="2400" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none" />
              {errors.gross_earned && <p className="mt-1 text-xs text-red-600">{errors.gross_earned.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Platform Deductions (PKR)</label>
              <input {...register('platform_deductions')} type="number" step="0.01" min="0" placeholder="720" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none" />
              {errors.platform_deductions && <p className="mt-1 text-xs text-red-600">{errors.platform_deductions.message}</p>}
            </div>
          </div>

          {/* Live deduction breakdown */}
          {gross > 0 && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-slate-500">Gross</p>
                  <p className="font-bold text-slate-900">PKR {Number(gross).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Commission {commissionPct}%</p>
                  <p className="font-bold text-red-600">−PKR {Number(deductions || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Net</p>
                  <p className="font-bold text-green-700">PKR {net.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting || loadingPlatforms}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {isSubmitting ? 'Saving...' : 'Save Shift'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
