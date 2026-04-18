import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/client';
import { useAuthStore } from '../store/auth-store';
import { formatDateTime } from '../lib/date-format';

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
        <div className="flex items-center justify-between animate-in-up">
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">Community Board 💬</h1>
            <p className="mt-1 text-sm text-cyan-200/70">Share your experiences, support each other</p>
          </div>
          {user?.role === 'worker' && (
            <button onClick={() => setShowForm(!showForm)} title={showForm ? 'Close complaint form' : 'Open complaint form'}
              className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 shadow-[0_8px_20px_rgba(34,211,238,0.3)] animate-in">
              {showForm ? '✕ Cancel' : '+ Post Complaint'}
            </button>
          )}
        </div>

        {/* Post form */}
        {showForm && (
          <form onSubmit={handleSubmit((d) => postMutation.mutate(d))} className="rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-6 shadow-[0_15px_45px_rgba(2,6,23,0.45)] backdrop-blur-lg space-y-4 animated-in">
            <h2 className="font-semibold text-cyan-100">Post a Complaint</h2>
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Category <span className="text-red-400">*</span></label>
              <select {...register('category')} className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" title="Select the complaint category">
                {Object.entries(catLabels).map(([v,l]) => <option key={v} value={v} className="bg-slate-900 text-cyan-100">{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-cyan-100">Description <span className="text-red-400">*</span></label>
              <textarea {...register('description')} rows={4} className="w-full rounded-lg border border-cyan-300/40 bg-slate-800/70 px-3 py-2.5 text-sm text-cyan-100 placeholder:text-cyan-300/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30" placeholder="Describe your issue in detail..." title="Provide details about your complaint" />
              {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_anonymous')} className="rounded border-cyan-300/40 bg-slate-800/70 text-cyan-400" />
              <span className="text-sm text-cyan-200">Post anonymously (your name/ID will not be shown)</span>
            </label>
            <p className="text-xs text-cyan-200/60">Tagging is handled by advocates and verifiers after review. Only they will see your identity.</p>
            <button type="submit" disabled={postMutation.isPending}
              title="Submit your complaint to the community board"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-600 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:from-lime-500 hover:to-cyan-500 disabled:opacity-60 transition-all duration-200 shadow-[0_8px_20px_rgba(132,204,22,0.3)]">
              {postMutation.isPending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {postMutation.isPending ? 'Posting...' : 'Submit Complaint'}
            </button>
          </form>
        )}

        {/* Grievance list */}
        {isLoading && (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-700 shimmer-loading" />)}</div>
        )}

        {grievances.length === 0 && !isLoading && (
          <div className="rounded-2xl border border-dashed border-cyan-300/30 bg-cyan-950/20 py-16 text-center animate-in">
            <div className="mb-3 text-5xl animate-bounce">💬</div>
            <h2 className="font-semibold text-cyan-100">No complaints yet</h2>
            <p className="mt-1 text-sm text-cyan-200/60">Be the first to post a complaint and help the community</p>
          </div>
        )}

        <div className="space-y-3">
          {grievances.map((g, idx) => (
            <div key={g.id} className="rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-5 shadow-[0_8px_20px_rgba(34,211,238,0.1)] backdrop-blur-lg transition-all hover:shadow-[0_12px_30px_rgba(34,211,238,0.2)] animate-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold transition-all ${
                      g.status === 'resolved' ? 'bg-lime-500/20 text-lime-200' :
                      g.status === 'escalated' ? 'bg-orange-500/20 text-orange-200' :
                      g.status === 'tagged' ? 'bg-fuchsia-500/20 text-fuchsia-200' :
                      'bg-cyan-500/20 text-cyan-200'
                    }`}>{g.status}</span>
                    <span className="text-xs font-medium text-cyan-200/80">{catLabels[g.category] || g.category}</span>
                    {g.is_anonymous && <span className="text-xs text-cyan-200/50 italic">🔒 anonymous</span>}
                    {g.city && <span className="text-xs text-cyan-200/60">{g.city}{g.zone ? ` · ${g.zone}` : ''}</span>}
                  </div>
                  <p className="text-sm text-cyan-100">{g.description}</p>
                  {g.tags?.filter(Boolean).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {g.tags.filter(Boolean).map(t => <span key={t} className="rounded-full bg-cyan-950/40 border border-cyan-300/20 px-2 py-0.5 text-xs text-cyan-200/70 font-medium">#{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button
                    onClick={() => upvoteMutation.mutate(g.id)}
                    disabled={Boolean(g.has_upvoted)}
                    title={g.has_upvoted ? 'You already upvoted this complaint' : 'Support this complaint with your vote'}
                    className="rounded-lg border border-cyan-300/30 bg-cyan-950/20 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-950/50 hover:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  >
                    👍 {g.upvote_count} {g.has_upvoted ? '✓' : ''}
                  </button>
                  <span className="text-xs text-cyan-200/50">{formatDateTime(g.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
