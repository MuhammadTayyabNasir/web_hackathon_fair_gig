import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import api from '../api/client';
import { useAuthStore } from '../store/auth-store';

const sevColors = {
  high: 'border-red-400 bg-red-50',
  medium: 'border-yellow-400 bg-yellow-50',
  low: 'border-slate-300 bg-slate-50',
};
const sevBadge = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-slate-100 text-slate-600',
};

export default function AnomaliesPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['anomalies', user?.id],
    queryFn: () => api.get(`/api/v1/anomaly/worker/${user?.id}`).then(r => r.data),
    enabled: !!user?.id,
  });

  const items = data?.data?.items || [];

  if (isLoading) return (
    <Layout>
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />)}
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">Failed to load anomalies</p>
        <button onClick={refetch} className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm text-white">Retry</button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Anomaly Alerts</h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-green-300 bg-green-50 py-16 text-center">
            <div className="mb-3 text-5xl">✅</div>
            <h2 className="text-lg font-semibold text-green-800">Your earnings look healthy!</h2>
            <p className="mt-1 text-sm text-green-600">No anomalies detected in your earnings history.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className={`rounded-2xl border-2 p-5 ${sevColors[item.severity] || sevColors.medium}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${sevBadge[item.severity] || sevBadge.medium}`}>
                        {item.severity?.toUpperCase()}
                      </span>
                      <span className="font-semibold text-slate-800">{item.anomaly_type?.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{item.plain_explanation}</p>
                    {item.z_score && (
                      <p className="mt-1 text-xs text-slate-500">Z-score: {Number(item.z_score).toFixed(2)} | Expected: {item.expected_value} | Actual: {item.actual_value}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right text-xs text-slate-500">
                    {new Date(item.detected_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
