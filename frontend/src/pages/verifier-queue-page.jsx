import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../api/client';

export default function VerifierQueuePage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['verifier-queue', page],
    queryFn: () => api.get(`/api/v1/earnings/pending?page=${page}&limit=20`).then(r => r.data),
    refetchInterval: 30000,
  });

  const queue = data?.data?.queue || [];
  const pagination = data?.pagination;

  if (isLoading) return (
    <Layout>
      <div className="space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />)}
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">Failed to load queue</p>
        <button onClick={refetch} className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm text-white">Retry</button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Verification Queue</h1>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
              {pagination?.total || 0} pending
            </span>
            <button onClick={refetch} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Refresh
            </button>
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-green-300 bg-green-50 py-16 text-center">
            <div className="mb-3 text-5xl">🎉</div>
            <h2 className="text-lg font-semibold text-green-800">Queue is clear — great work!</h2>
            <p className="mt-1 text-sm text-green-600">No pending shifts to verify right now.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Worker</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Platform</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3 text-right">Commission %</th>
                  <th className="px-4 py-3 text-left">Screenshot</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((item) => (
                  <tr key={item.verification_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{item.worker_name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.work_date}</td>
                    <td className="px-4 py-3 text-slate-600">{item.platform_name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">PKR {Number(item.net_received).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{Number(item.commission_rate_pct).toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      {item.screenshot_url
                        ? <a href={item.screenshot_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">View</a>
                        : <span className="text-xs text-slate-400">None</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/verifier/review/${item.shift_id}`}
                        className="rounded-md bg-blue-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                        Review
                      </Link>
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
