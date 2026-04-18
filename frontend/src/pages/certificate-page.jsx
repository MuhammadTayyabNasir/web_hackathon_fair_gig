import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/client';
import { formatDateTime } from '../lib/date-format';

const schema = z.object({
  from_date: z.string().min(1, 'From date required'),
  to_date: z.string().min(1, 'To date required'),
});

export default function CertificatePage() {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  const { data: certsData, refetch: refetchCerts } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => api.get('/api/v1/analytics/worker').then(r => r.data),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      from_date: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to_date: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(data) {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/certificate/generate?from_date=${data.from_date}&to_date=${data.to_date}`);
      setGenerated(res.data.data);
      toast.success('Certificate generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate certificate');
    } finally {
      setLoading(false);
    }
  }

  const certUrl = generated ? `http://localhost:8002/cert/${generated.token}` : null;

  return (
    <Layout>
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Income Certificate</h1>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm text-slate-600">
            Generate a verified income certificate for your selected date range. Share it with banks, embassies, or employers.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">From Date</label>
                <input {...register('from_date')} type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
                {errors.from_date && <p className="mt-1 text-xs text-red-600">{errors.from_date.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">To Date</label>
                <input {...register('to_date')} type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
                {errors.to_date && <p className="mt-1 text-xs text-red-600">{errors.to_date.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {loading ? 'Generating...' : 'Generate Certificate'}
            </button>
          </form>
        </div>

        {generated && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <div className="mb-3 flex items-center gap-2 text-green-800">
              <span className="text-xl">✅</span>
              <span className="font-semibold">Certificate Generated!</span>
            </div>
            <p className="mb-1 text-sm text-slate-600">Token: <code className="rounded bg-white px-1 py-0.5 text-xs">{generated.token}</code></p>
            <p className="text-sm text-slate-600">Generated: {formatDateTime(generated.generated_at)}</p>
            <div className="mt-4 flex gap-3">
              <a href={certUrl} target="_blank" rel="noreferrer"
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600">
                View Certificate
              </a>
              <a href={certUrl} target="_blank" rel="noreferrer"
                className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-100">
                Print / PDF
              </a>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-xs text-yellow-700">
            <strong>Note:</strong> This certificate reflects self-reported and community-verified earnings. It is not a government document.
          </p>
        </div>
      </div>
    </Layout>
  );
}
