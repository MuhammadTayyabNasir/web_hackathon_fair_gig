import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/client';

export default function VerifierReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['shift', id],
    queryFn: () => api.get(`/api/v1/earnings/shifts/${id}`).then(r => r.data),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { status: 'verified' } });
  const status = watch('status');

  const shift = data?.data?.shift;

  async function onSubmit(formData) {
    setSubmitting(true);
    try {
      await api.put(`/api/v1/earnings/shifts/${id}/verify`, formData);
      toast.success(`Shift marked as ${formData.status}`);
      navigate('/verifier/queue');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <Layout><div className="h-64 animate-pulse rounded-xl bg-slate-200" /></Layout>;
  if (error || !shift) return (
    <Layout>
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">Shift not found</p>
        <button onClick={() => navigate('/verifier/queue')} className="mt-3 text-sm text-blue-700 hover:underline">← Back to queue</button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Review Shift</h1>
          <button onClick={() => navigate('/verifier/queue')} className="text-sm text-slate-500 hover:underline">← Back to queue</button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-700">Shift Details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Date', shift.work_date],
              ['Platform', shift.platform_name],
              ['Shift Hours', shift.shift_start && shift.shift_end ? `${shift.shift_start} – ${shift.shift_end}` : `${shift.hours_worked}h declared`],
              ['Gross Earned', `PKR ${Number(shift.gross_earned).toLocaleString()}`],
              ['Deductions', `PKR ${Number(shift.platform_deductions).toLocaleString()}`],
              ['Net Received', `PKR ${Number(shift.net_received).toLocaleString()}`],
              ['Commission %', `${Number(shift.commission_rate_pct).toFixed(1)}%`],
              ['Source', shift.import_source],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          {shift.screenshot_url && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Screenshot</p>
              <a href={shift.screenshot_url} target="_blank" rel="noreferrer" className="inline-block rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-blue-700 hover:bg-slate-100">
                View Screenshot ↗
              </a>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-700">Verification Decision</h2>
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { value: 'verified', label: '✅ Verified', cls: 'border-green-400 bg-green-50 text-green-800' },
              { value: 'flagged', label: '🚩 Flag', cls: 'border-yellow-400 bg-yellow-50 text-yellow-800' },
              { value: 'unverifiable', label: '❌ Unverifiable', cls: 'border-red-400 bg-red-50 text-red-800' },
            ].map((opt) => (
              <label key={opt.value} className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-3 text-center font-semibold text-sm ${
                status === opt.value ? opt.cls : 'border-slate-200 text-slate-500'
              }`}>
                <input type="radio" value={opt.value} {...register('status')} className="hidden" />
                {opt.label}
              </label>
            ))}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Note (optional)</label>
            <textarea {...register('verifier_note')} rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Add context about your decision..." />
          </div>

          {status === 'flagged' && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">Flagged Reason</label>
              <input {...register('flagged_reason')} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="e.g. Commission rate too high" />
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {submitting ? 'Submitting...' : 'Submit Decision'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
