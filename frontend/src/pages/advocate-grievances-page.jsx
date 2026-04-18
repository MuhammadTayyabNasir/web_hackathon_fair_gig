import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/client';
import { formatDateTime } from '../lib/date-format';

const statusColors = {
  open: 'bg-blue-100 text-blue-700',
  tagged: 'bg-yellow-100 text-yellow-700',
  escalated: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700',
};

const tagLegend = [
  { tag: 'commission-issue', color: '🔴 Red', meaning: 'About commission rates' },
  { tag: 'urgent', color: '🟠 Orange', meaning: 'Needs fast attention' },
  { tag: 'verified', color: '🟢 Green', meaning: "Advocate confirmed it's real" },
  { tag: 'needs-review', color: '🔵 Blue', meaning: 'Needs more investigation' },
  { tag: 'escalated', color: '🟣 Purple', meaning: 'Sent to higher authority' },
];

export default function AdvocateGrievancesPage() {
  const [filter, setFilter] = useState('open');
  const [selected, setSelected] = useState(null);
  const [tagId, setTagId] = useState('');
  const [note, setNote] = useState('');
  const [infoTab, setInfoTab] = useState('tag-guide');
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['grievances', filter],
    queryFn: () => api.get(`/api/v1/grievances?status=${filter}&limit=50`).then(r => r.data),
  });

  const { data: tagsData } = useQuery({
    queryKey: ['grievance-tags'],
    queryFn: () => api.get('/api/v1/grievances/tags').then(r => r.data),
  });

  const { data: clustersData } = useQuery({
    queryKey: ['clusters'],
    queryFn: () => api.get('/api/v1/grievances/clusters').then(r => r.data),
  });

  const grievances = data?.data?.grievances || [];
  const tags = tagsData?.data?.tags || [];
  const clusters = clustersData?.data?.clusters || [];

  const mutate = () => ({
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grievances'] });
      toast.success('Updated');
      setSelected(null);
      setNote('');
      setTagId('');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Action failed'),
  });

  const tagMutation = useMutation({ mutationFn: (gId) => api.put(`/api/v1/grievances/${gId}/tag`, { tag_id: tagId }), ...mutate() });
  const escalateMutation = useMutation({ mutationFn: (gId) => api.put(`/api/v1/grievances/${gId}/escalate`, { note }), ...mutate() });
  const resolveMutation = useMutation({ mutationFn: (gId) => api.put(`/api/v1/grievances/${gId}/resolve`, { note }), ...mutate() });

  const sel = selected ? grievances.find(g => g.id === selected) : null;

  return (
    <Layout>
      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/55 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                title="Learn what each grievance tag means"
                onClick={() => setInfoTab('tag-guide')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${infoTab === 'tag-guide' ? 'bg-cyan-500/20 text-cyan-100' : 'bg-slate-800/70 text-slate-300 hover:bg-cyan-500/10'}`}
              >
                Tag Guide
              </button>
              <button
                type="button"
                title="Read how to triage and resolve complaints"
                onClick={() => setInfoTab('workflow')}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${infoTab === 'workflow' ? 'bg-cyan-500/20 text-cyan-100' : 'bg-slate-800/70 text-slate-300 hover:bg-cyan-500/10'}`}
              >
                Workflow
              </button>
            </div>

            {infoTab === 'tag-guide' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-cyan-100/80">
                      <th className="pb-2 pr-3">Tag</th>
                      <th className="pb-2 pr-3">Color</th>
                      <th className="pb-2">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tagLegend.map((row) => (
                      <tr key={row.tag} className="border-t border-cyan-300/15 text-cyan-50/95">
                        <td className="py-2 pr-3 font-semibold">{row.tag}</td>
                        <td className="py-2 pr-3">{row.color}</td>
                        <td className="py-2">{row.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-cyan-100/90">
                <p>1. Read details and confirm whether the complaint is anonymous or named.</p>
                <p>2. Apply a tag using the dropdown so the team can triage quickly.</p>
                <p>3. Add note and Escalate if it needs higher authority review.</p>
                <p>4. Resolve only after evidence checks and worker follow-up.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Grievances</h1>
            <div className="flex gap-1">
              {['open','tagged','escalated','resolved'].map(s => (
                <button key={s} onClick={() => setFilter(s)} title={`Filter grievances by ${s} status`}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${filter === s ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {isLoading && <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200"/>)}</div>}

          {grievances.length === 0 && !isLoading && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
              <p className="text-slate-500">No {filter} grievances</p>
            </div>
          )}

          <div className="space-y-3">
            {grievances.map((g) => (
              <div key={g.id}
                onClick={() => setSelected(selected === g.id ? null : g.id)}
                className={`cursor-pointer rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${selected === g.id ? 'border-blue-400' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[g.status] || 'bg-slate-100 text-slate-600'}`}>{g.status}</span>
                      <span className="text-xs text-slate-500 capitalize">{g.category?.replace(/_/g,' ')}</span>
                      {g.is_anonymous && <span className="text-xs text-slate-400 italic">anonymous</span>}
                      {g.tags?.filter(Boolean).map(t => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">#{t}</span>)}
                    </div>
                    <p className="mt-1 text-sm text-slate-700 line-clamp-2">{g.description}</p>
                    <p className="mt-1 text-xs text-slate-400">{g.city} {g.zone ? `· ${g.zone}` : ''} · {g.upvote_count} upvotes · {formatDateTime(g.created_at)}</p>
                  </div>
                </div>

                {selected === g.id && (
                  <div className="mt-4 border-t border-slate-100 pt-4 space-y-3" onClick={e => e.stopPropagation()}>
                    <p className="text-sm text-slate-700">{g.description}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <p className="text-xs text-slate-500">Worker: <span className="font-medium text-slate-700">{g.worker_name || 'Anonymous'}</span></p>
                      <p className="text-xs text-slate-500">Worker Email: <span className="font-medium text-slate-700">{g.worker_email || 'Hidden (anonymous)'}</span></p>
                      <p className="text-xs text-slate-500">Created: <span className="font-medium text-slate-700">{formatDateTime(g.created_at)}</span></p>
                      <p className="text-xs text-slate-500">Updated: <span className="font-medium text-slate-700">{formatDateTime(g.updated_at)}</span></p>
                    </div>
                    {g.escalated_at && <p className="text-xs text-slate-500">Escalated: <span className="font-medium text-slate-700">{formatDateTime(g.escalated_at)}</span></p>}
                    {g.resolved_at && <p className="text-xs text-slate-500">Resolved: <span className="font-medium text-slate-700">{formatDateTime(g.resolved_at)}</span></p>}
                    {g.advocate_note && <p className="text-xs text-slate-500 italic">Advocate note: {g.advocate_note}</p>}

                    {/* Tag */}
                    <div className="flex gap-2">
                      <select value={tagId} onChange={e => setTagId(e.target.value)} title="Select the best matching classification tag" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900">
                        <option value="">Select tag...</option>
                        {tags.map(t => <option key={t.id} value={t.id}>#{t.name}</option>)}
                      </select>
                      <button onClick={() => tagId && tagMutation.mutate(g.id)} disabled={!tagId} title="Apply selected tag to this grievance"
                        className="rounded-lg bg-yellow-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Tag</button>
                    </div>
                    {tags.length === 0 && <p className="text-xs text-amber-700">No tags are available yet. Reload in a few seconds.</p>}

                    {/* Note + actions */}
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Add note (optional)..." />

                    <div className="flex gap-2">
                      {g.status !== 'escalated' && g.status !== 'resolved' && (
                        <button onClick={() => escalateMutation.mutate(g.id)} title="Move this complaint to higher-priority escalation" className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white">Escalate</button>
                      )}
                      {g.status !== 'resolved' && (
                        <button onClick={() => resolveMutation.mutate(g.id)} title="Mark this complaint as resolved" className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white">Resolve</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Clusters sidebar */}
        <div className="hidden lg:block w-72 shrink-0 space-y-4">
          <h2 className="font-semibold text-slate-700">Complaint Clusters</h2>
          {clusters.length === 0 ? (
            <p className="text-sm text-slate-500">No clusters yet</p>
          ) : (
            clusters.map(c => (
              <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-800">{c.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{c.platform_name} · {c.complaint_count} complaints</p>
                {c.description && <p className="mt-1 text-xs text-slate-400">{c.description}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
