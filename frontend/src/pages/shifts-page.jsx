import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../api/client';

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3,4,5].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-200" />)}
    </div>
  );
}

const statusColors = {
  verified: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  flagged: 'bg-red-100 text-red-700',
  unverifiable: 'bg-slate-100 text-slate-600',
};

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">My Shifts</h1>
          <div className="flex gap-2">
            <Link to="/worker/shifts/import" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Import CSV
            </Link>
            <Link to="/worker/shifts/add" className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              + Add Shift
            </Link>
          </div>
        </div>

        {shifts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="mx-auto mb-4 text-5xl">📋</div>
            <h2 className="text-lg font-semibold text-slate-700">No shifts yet</h2>
            <p className="mt-1 text-sm text-slate-500">Log your first shift to start tracking earnings</p>
            <Link to="/worker/shifts/add" className="mt-4 inline-block rounded-xl bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white">
              Log your first shift
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Platform</th>
                  <th className="px-4 py-3 text-right">Gross</th>
                  <th className="px-4 py-3 text-right">Deductions</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3 text-right">Commission %</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{s.work_date}</td>
                    <td className="px-4 py-3 text-slate-600">{s.platform_name}</td>
                    <td className="px-4 py-3 text-right">PKR {Number(s.gross_earned).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-red-600">−PKR {Number(s.platform_deductions).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">PKR {Number(s.net_received).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{Number(s.commission_rate_pct).toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[s.verification_status] || statusColors.pending}`}>
                        {s.verification_status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-40">Previous</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
