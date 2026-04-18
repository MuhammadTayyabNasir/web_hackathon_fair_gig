import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Layout from '../components/Layout';
import api from '../api/client';

function Skeleton() {
  return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200" />)}</div>;
}

export default function AdvocateDashboardPage() {
  const { data: trendsData, isLoading: l1 } = useQuery({
    queryKey: ['commission-trends'],
    queryFn: () => api.get('/api/v1/analytics/commission-trends').then(r => r.data),
  });
  const { data: vulnData, isLoading: l2 } = useQuery({
    queryKey: ['vulnerability'],
    queryFn: () => api.get('/api/v1/analytics/vulnerability').then(r => r.data),
  });
  const { data: distData, isLoading: l3 } = useQuery({
    queryKey: ['income-distribution'],
    queryFn: () => api.get('/api/v1/analytics/income-distribution').then(r => r.data),
  });
  const { data: platformData, isLoading: l4 } = useQuery({
    queryKey: ['platform-comparison'],
    queryFn: () => api.get('/api/v1/analytics/platform-comparison').then(r => r.data),
  });
  const { data: complaintsData } = useQuery({
    queryKey: ['top-complaints'],
    queryFn: () => api.get('/api/v1/analytics/top-complaints').then(r => r.data),
  });

  if (l1 || l2 || l3 || l4) return <Layout><Skeleton /></Layout>;

  const trends = trendsData?.data?.trends || [];
  const vulnerable = vulnData?.data?.flagged || [];
  const distribution = distData?.data?.distribution || [];
  const platforms = platformData?.data?.comparison || [];
  const complaints = complaintsData?.data?.top_complaints || [];

  // Build pivot data for commission trends chart
  const platformNames = [...new Set(trends.map(t => t.platform))];
  const monthMap = {};
  trends.forEach(t => {
    if (!monthMap[t.month]) monthMap[t.month] = { month: t.month };
    monthMap[t.month][t.platform] = Number(t.avg_rate).toFixed(1);
  });
  const trendsChart = Object.values(monthMap).sort((a,b) => a.month.localeCompare(b.month));

  const COLORS = ['#1e40af','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2'];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Advocate Analytics Dashboard</h1>

        {/* Vulnerability flags */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Vulnerability Flags</h2>
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">{vulnerable.length} workers flagged</span>
          </div>
          {vulnerable.length === 0 ? (
            <p className="text-sm text-slate-500">No workers with 20%+ income drop this month.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 text-left">Worker</th>
                    <th className="py-2 text-left">City / Zone</th>
                    <th className="py-2 text-left">Category</th>
                    <th className="py-2 text-right">Prev Month</th>
                    <th className="py-2 text-right">Curr Month</th>
                    <th className="py-2 text-right">Drop %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vulnerable.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 font-medium">{v.name}</td>
                      <td className="py-2 text-slate-500">{v.city} / {v.zone}</td>
                      <td className="py-2 text-slate-500">{v.category}</td>
                      <td className="py-2 text-right">PKR {Number(v.prev_net).toLocaleString()}</td>
                      <td className="py-2 text-right">PKR {Number(v.curr_net).toLocaleString()}</td>
                      <td className="py-2 text-right font-bold text-red-600">−{v.drop_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commission trends */}
        {trendsChart.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-700">Commission Rate Trends by Platform (Lahore)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
                {platformNames.map((name, i) => (
                  <Line key={name} type="monotone" dataKey={name} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Platform comparison */}
        {platforms.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-700">Platform Comparison — Avg Commission vs Hourly Rate</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={platforms.map(p => ({ platform: p.platform, commission: Number(p.avg_commission).toFixed(1), hourly: Number(p.avg_hourly).toFixed(0) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="commission" name="Avg Commission %" fill="#dc2626" radius={[4,4,0,0]} />
                <Bar yAxisId="right" dataKey="hourly" name="Avg Hourly (PKR)" fill="#1e40af" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Income distribution by zone */}
        {distribution.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-700">Income Distribution by City / Zone</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 text-left">City</th>
                    <th className="py-2 text-left">Zone</th>
                    <th className="py-2 text-left">Category</th>
                    <th className="py-2 text-right">Workers</th>
                    <th className="py-2 text-right">Avg Net/Shift</th>
                    <th className="py-2 text-right">Median Net</th>
                    <th className="py-2 text-right">Avg Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {distribution.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 font-medium">{d.city}</td>
                      <td className="py-2 text-slate-500">{d.zone}</td>
                      <td className="py-2 text-slate-500">{d.category}</td>
                      <td className="py-2 text-right">{d.worker_count}</td>
                      <td className="py-2 text-right">PKR {Number(d.avg_net_per_shift).toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                      <td className="py-2 text-right">PKR {Number(d.median_net).toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                      <td className="py-2 text-right">{Number(d.avg_commission).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
