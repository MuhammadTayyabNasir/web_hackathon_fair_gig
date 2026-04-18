import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Layout from '../components/Layout';
import api from '../api/client';

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200" />)}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function WorkerAnalyticsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['worker-analytics'],
    queryFn: () => api.get('/api/v1/analytics/worker').then(r => r.data),
  });

  const { data: medianData } = useQuery({
    queryKey: ['city-median'],
    queryFn: () => api.get('/api/v1/analytics/city-median').then(r => r.data),
  });

  if (isLoading) return <Layout><Skeleton /></Layout>;
  if (error) return (
    <Layout>
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">Failed to load analytics</p>
        <button onClick={refetch} className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm text-white">Retry</button>
      </div>
    </Layout>
  );

  const totals = data?.data?.totals || {};
  const monthly = data?.data?.monthly || [];
  const platforms = data?.data?.platform_breakdown || [];
  const medians = medianData?.data?.medians || [];

  const chartData = monthly.map(m => ({
    month: m.month,
    net: Number(m.net).toFixed(0),
    gross: Number(m.gross).toFixed(0),
    commission: Number(m.avg_commission).toFixed(1),
    hourly: Number(m.avg_hourly).toFixed(0),
  }));

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Income Analytics</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Shifts" value={totals.total_shifts || 0} />
          <StatCard label="Total Net Earnings" value={`PKR ${Number(totals.total_net || 0).toLocaleString()}`} />
          <StatCard label="Avg Commission Rate" value={`${Number(totals.avg_commission || 0).toFixed(1)}%`} />
          <StatCard label="Avg Hourly Rate" value={`PKR ${Number(totals.avg_hourly || 0).toFixed(0)}/hr`} />
        </div>

        {/* Monthly earnings chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-700">Monthly Income (Last 6 Months)</h2>
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-slate-500">No monthly data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `PKR ${Number(v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="gross" name="Gross" fill="#bfdbfe" radius={[4,4,0,0]} />
                <Bar dataKey="net" name="Net" fill="#1e40af" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Commission trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-700">Commission Rate Trend</h2>
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-slate-500">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis unit="%" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Line type="monotone" dataKey="commission" name="Avg Commission %" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* City median comparison */}
        {medians.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 font-semibold text-slate-700">City Median Commission Rates</h2>
            <p className="mb-4 text-xs text-slate-400">Anonymised city-wide data from commission snapshots</p>
            <div className="space-y-3">
              {medians.map((m) => (
                <div key={m.platform} className="flex items-center gap-4">
                  <span className="w-28 text-sm font-medium text-slate-700">{m.platform}</span>
                  <div className="flex-1 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-blue-800" style={{ width: `${Math.min(100, Number(m.median_rate))}%` }} />
                  </div>
                  <span className="w-16 text-right text-sm font-semibold text-slate-900">{Number(m.median_rate).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform breakdown */}
        {platforms.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-700">Earnings by Platform</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2 text-left">Platform</th>
                    <th className="py-2 text-right">Shifts</th>
                    <th className="py-2 text-right">Net Earned</th>
                    <th className="py-2 text-right">Avg Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {platforms.map((p) => (
                    <tr key={p.platform}>
                      <td className="py-2 font-medium">{p.platform}</td>
                      <td className="py-2 text-right">{p.shifts}</td>
                      <td className="py-2 text-right font-semibold text-green-700">PKR {Number(p.net).toLocaleString()}</td>
                      <td className="py-2 text-right">{Number(p.avg_commission).toFixed(1)}%</td>
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
