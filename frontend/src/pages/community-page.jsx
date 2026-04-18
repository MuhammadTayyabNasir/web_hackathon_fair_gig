import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/client';
import { useAuthStore } from '../store/auth-store';

const schema = z.object({
  category: z.enum(['commission_change', 'deactivation', 'payment_delay', 'unfair_rating', 'account_issue', 'other']),
  description: z.string().min(10, 'At least 10 characters').max(2000),
  is_anonymous: z.boolean(),
});

const catLabels = {
  commission_change: 'Commission Change',
  deactivation: 'Deactivation',
  payment_delay: 'Payment Delay',
  unfair_rating: 'Unfair Rating',
  account_issue: 'Account Issue',
  other: 'Other',
};

const statusColors = {
  open: 'bg-blue-100 text-blue-700',
  tagged: 'bg-yellow-100 text-yellow-700',
  escalated: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700',
};

export default function CommunityPage() {
  const user = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['community-grievances'],
    queryFn: () => api.get('/api/v1/grievances?limit=30').then(r => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { category: 'commission_change', is_anonymous: false },
  });

  const postMutation = useMutation({
    mutationFn: (data) => api.post('/api/v1/grievances', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-grievances'] });
      toast.success('Complaint posted!');
      reset();
      setShowForm(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to post'),
  });

  const upvoteMutation = useMutation({
    mutationFn: (id) => api.put(`/api/v1/grievances/${id}/upvote`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community-grievances'] }),
    onError: () => toast.error('Failed to upvote'),
  });

  const grievances = data?.data?.grievances || [];

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Community Board</h1>
          {user?.role === 'worker' && (
            <button onClick={() => setShowForm(!showForm)}
              className="rounded-xl bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              {showForm ? 'Cancel' : '+ Post Complaint'}
            </button>
          )}
        </div>

        {/* Post form */}
        {showForm && (
          <form onSubmit={handleSubmit((d) => postMutation.mutate(d))} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-700">Post a Complaint</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
              <select {...register('category')} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none">
                {Object.entries(catLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea {...register('description')} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="Describe your issue in detail..." />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_anonymous')} className="rounded" />
              <span className="text-sm text-slate-600">Post anonymously (your name/ID will not be shown)</span>
            </label>
            <button type="submit" disabled={postMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {postMutation.isPending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              Submit Complaint
            </button>
          </form>
        )}

        {/* Grievance list */}
        {isLoading && (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />)}</div>
        )}

        {grievances.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="mb-3 text-5xl">💬</div>
            <h2 className="font-semibold text-slate-700">No complaints yet</h2>
            <p className="mt-1 text-sm text-slate-500">Be the first to post a complaint</p>
          </div>
        )}

        <div className="space-y-4">
          {grievances.map((g) => (
            <div key={g.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[g.status] || 'bg-slate-100 text-slate-600'}`}>{g.status}</span>
                    <span className="text-xs font-medium text-slate-600">{catLabels[g.category] || g.category}</span>
                    {g.is_anonymous && <span className="text-xs text-slate-400 italic">anonymous</span>}
                    {g.city && <span className="text-xs text-slate-400">{g.city}{g.zone ? ` · ${g.zone}` : ''}</span>}
                  </div>
                  <p className="text-sm text-slate-700">{g.description}</p>
                  {g.tags?.filter(Boolean).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {g.tags.filter(Boolean).map(t => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">#{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button onClick={() => upvoteMutation.mutate(g.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    ▲ {g.upvote_count}
                  </button>
                  <span className="text-xs text-slate-400">{new Date(g.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
