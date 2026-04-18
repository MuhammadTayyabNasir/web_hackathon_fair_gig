import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../api/client';
import { useAuthStore } from '../store/auth-store';
import { formatDate, formatDateTime } from '../lib/date-format';

function StatCard({ label, value, color = 'bg-slate-50' }) {
  return (
    <div className={`rounded-xl border border-slate-200 p-5 ${color}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />)}</div>
      <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}

const sevColors = { high: 'text-red-700 bg-red-50 border-red-200', medium: 'text-yellow-700 bg-yellow-50 border-yellow-200', low: 'text-slate-600 bg-slate-50 border-slate-200' };

export default function WorkerDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: shiftsData, isLoading: sl } = useQuery({
    queryKey: ['shifts', 1],
    queryFn: () => api.get('/api/v1/earnings/shifts?page=1&limit=5').then(r => r.data),
  });
  const { data: summaryData, isLoading: suml } = useQuery({
    queryKey: ['earnings-summary'],
    queryFn: () => api.get('/api/v1/earnings/summary').then(r => r.data),
  });
  const { data: anomalyData, isLoading: al } = useQuery({
    queryKey: ['anomalies', user?.id],
    queryFn: () => api.get(`/api/v1/anomaly/worker/${user?.id}`).then(r => r.data),
    enabled: !!user?.id,
  });

  if (sl || suml || al) return <Layout><Skeleton /></Layout>;

  const shifts = shiftsData?.data?.shifts || [];
  const summary = summaryData?.data?.summary || {};
  const anomalies = (anomalyData?.data?.items || []).slice(0, 3);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}! 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Here's your income snapshot.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Shifts" value={summary.total_shifts || 0} />
          <StatCard label="Net Earned (All Time)" value={`PKR ${Number(summary.total_net || 0).toLocaleString()}`} color="bg-green-50" />
          <StatCard label="Avg Commission Rate" value={`${Number(summary.avg_commission_rate || 0).toFixed(1)}%`} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link to="/worker/shifts/add" className="flex items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            + Log Shift
          </Link>
          <Link to="/worker/shifts/import" className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Import CSV
          </Link>
          <Link to="/worker/certificate" className="flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-100">
            📄 Get Certificate
          </Link>
        </div>

        {/* Recent shifts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Recent Shifts</h2>
            <Link to="/worker/shifts" className="text-sm text-blue-700 hover:underline">View all →</Link>
          </div>
          {shifts.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-2 text-4xl">📋</div>
              <p className="text-slate-500">No shifts yet</p>
              <Link to="/worker/shifts/add" className="mt-3 inline-block rounded-xl bg-blue-800 px-5 py-2 text-sm font-semibold text-white">Log your first shift</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 text-left">Date</th>
                    <th className="py-2 text-left">Platform</th>
                    <th className="py-2 text-right">Net</th>
                    <th className="py-2 text-right">Commission</th>
                    <th className="py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shifts.map(s => (
                    <tr key={s.id}>
                      <td className="py-2">{formatDate(s.work_date)}</td>
                      <td className="py-2 text-slate-500">{s.platform_name}</td>
                      <td className="py-2 text-right font-semibold text-green-700">PKR {Number(s.net_received).toLocaleString()}</td>
                      <td className="py-2 text-right">{Number(s.commission_rate_pct).toFixed(1)}%</td>
                      <td className="py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          s.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{s.verification_status || 'pending'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Anomaly alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Anomaly Alerts</h2>
            <Link to="/worker/anomalies" className="text-sm text-blue-700 hover:underline">View all →</Link>
          </div>
          {anomalies.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
              <span className="text-2xl">✅</span>
              <p className="text-sm font-medium text-green-800">Your earnings look healthy! No anomalies detected.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {anomalies.map(a => (
                <div key={a.id} className={`rounded-xl border p-4 ${sevColors[a.severity] || sevColors.medium}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase">{a.severity}</span>
                      <span className="mx-2 text-slate-400">·</span>
                      <span className="text-sm font-medium">{a.anomaly_type?.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDateTime(a.detected_at)}</span>
                  </div>
                  <p className="mt-1 text-sm">{a.plain_explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
