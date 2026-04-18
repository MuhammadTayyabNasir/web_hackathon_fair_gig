import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/client';
import { formatDate } from '../lib/date-format';

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3,4,5].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-700 shimmer-loading" />)}
    </div>
  );
}

export default function ShiftsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['shifts', page],
    queryFn: () => api.get(`/api/v1/earnings/shifts?page=${page}&limit=20`).then(r => r.data),
  });

  const shifts = data?.data?.shifts || [];
  const pagination = data?.pagination;

  if (isLoading) return <Layout><Skeleton /></Layout>;

  if (error) return (
    <Layout>
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">Failed to load shifts</p>
        <button onClick={refetch} className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm text-white">Retry</button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-in-up">
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">My Shifts 📋</h1>
            <p className="mt-1 text-sm text-cyan-200/70">Track all your work history and earnings</p>
          </div>
          <div className="flex gap-2">
            <Link to="/worker/shifts/import" className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/25 transition-all" title="Bulk import shifts from CSV">
              📥 Import CSV
            </Link>
            <Link to="/worker/shifts/add" className="rounded-lg bg-gradient-to-r from-lime-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:from-lime-500 hover:to-cyan-500 transition-all shadow-[0_8px_20px_rgba(132,204,22,0.3)]" title="Add a new shift manually">
              + Add Shift
            </Link>
          </div>
        </div>

        {shifts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-cyan-300/30 bg-cyan-950/20 py-16 text-center animate-in">
            <div className="mx-auto mb-4 text-5xl animate-bounce">📋</div>
            <h2 className="text-lg font-semibold text-cyan-100">No shifts logged yet</h2>
            <p className="mt-1 text-sm text-cyan-200/60">Start tracking your earnings and work history</p>
            <Link to="/worker/shifts/add" className="mt-4 inline-block rounded-xl bg-gradient-to-r from-lime-600 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:from-lime-500 hover:to-cyan-500 transition-all">
              Log your first shift
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-slate-900/50 to-slate-800/30 shadow-[0_8px_24px_rgba(34,211,238,0.15)] backdrop-blur-lg">
            <table className="w-full text-sm">
              <thead className="border-b border-cyan-300/20 bg-cyan-950/40 text-xs uppercase tracking-wide text-cyan-200">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Platform</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">Deductions</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3 text-right">Commission %</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-300/10">
                {shifts.map((s) => (
                  <tr key={s.id} className="transition-all hover:bg-cyan-950/60 hover:border-cyan-300/30 group">
                    <td className="px-4 py-3 font-medium text-cyan-100 group-hover:text-cyan-50">{formatDate(s.work_date)}</td>
                    <td className="px-4 py-3 text-cyan-200/80 group-hover:text-cyan-100">{s.platform_name}</td>
                    <td className="px-4 py-3 text-right text-cyan-200 group-hover:text-cyan-100">PKR {Number(s.gross_earned).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-red-400 group-hover:text-red-300">−PKR {Number(s.platform_deductions).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-lime-400 group-hover:text-lime-300">PKR {Number(s.net_received).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-fuchsia-300 group-hover:text-fuchsia-200">{Number(s.commission_rate_pct).toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold transition-all ${
                        s.verification_status === 'verified' ? 'bg-lime-500/20 text-lime-200' :
                        s.verification_status === 'pending' ? 'bg-yellow-500/20 text-yellow-200' :
                        s.verification_status === 'flagged' ? 'bg-red-500/20 text-red-200' :
                        'bg-cyan-500/20 text-cyan-200'
                      }`}>
                        {s.verification_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.verification_status === 'verified' ? (
                        <span className="rounded-md border border-lime-400/30 bg-lime-500/10 px-2 py-1 text-xs text-lime-200">Locked</span>
                      ) : (
                        <Link
                          to={`/worker/shifts/${s.id}/edit`}
                          className="rounded-md border border-cyan-300/40 bg-cyan-500/15 px-2 py-1 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/25"
                        >
                          Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-cyan-300/15 px-4 py-3">
                <p className="text-sm text-cyan-200/70">Page {pagination.page} of {pagination.totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="rounded-md border border-cyan-300/30 bg-cyan-950/30 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-950/60 disabled:opacity-40 transition-all" title="Previous page">Previous</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}
                    className="rounded-md border border-cyan-300/30 bg-cyan-950/30 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-950/60 disabled:opacity-40 transition-all" title="Next page">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
