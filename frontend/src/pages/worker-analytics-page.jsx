import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import Layout from '../components/Layout';
import api from '../api/client';

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200 shimmer-loading" />)}
    </div>
  );
}

function StatCard({ label, value, sub, trend }) {
  return (
    <div className="rounded-xl border border-cyan-300/25 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-5 shadow-[0_8px_20px_rgba(34,211,238,0.15)] backdrop-blur-lg animate-in transition-all hover:shadow-[0_12px_30px_rgba(34,211,238,0.25)]">
      <p className="text-xs uppercase tracking-widest text-cyan-200/70">{label}</p>
      <p className="mt-2 text-2xl font-bold text-cyan-100">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-cyan-200/60">{sub}</p>}
      {trend && <p className={`mt-1 text-xs font-semibold ${trend > 0 ? 'text-lime-400' : 'text-orange-400'}`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs prev month
      </p>}
    </div>
  );
}

const chartColors = {
  gross: '#22d3ee',
  net: '#84cc16',
  commission: '#f472b6',
  hourly: '#fbbf24',
  platform1: '#06b6d4',
  platform2: '#f472b6',
  platform3: '#84cc16',
  platform4: '#fbbf24',
  platform5: '#fb923c',
};

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatPkr(value) {
  return `PKR ${toNumber(value).toLocaleString()}`;
}

export default function WorkerAnalyticsPage() {
  const [chartFilter, setChartFilter] = useState('all');
  
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
      <div className="rounded-xl border border-red-300/40 bg-red-950/40 p-6 text-center animate-in">
        <p className="text-red-200">Failed to load analytics</p>
        <button onClick={refetch} className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500 transition-all">Retry</button>
      </div>
    </Layout>
  );

  const totals = data?.data?.totals || {};
  const monthly = data?.data?.monthly || [];
  const platforms = data?.data?.platform_breakdown || [];
  const medians = medianData?.data?.medians || [];

  const chartData = monthly.map(m => ({
    month: m.month,
    net: toNumber(m.net),
    gross: toNumber(m.gross),
    commission: toNumber(m.avg_commission),
    hourly: toNumber(m.avg_hourly),
  }));

  const platformChartData = platforms.slice(0, 5).map((p, i) => ({
    name: p.platform_name,
    earnings: toNumber(p.total_net),
    commission: toNumber(p.avg_commission),
    color: Object.values(chartColors)[i + 1] || chartColors.platform1,
  }));

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between animate-in-up">
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">Income Analytics 📊</h1>
            <p className="mt-1 text-sm text-cyan-200/70">Track your earnings, commission rates & hourly income</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Shifts" value={totals.total_shifts || 0} />
          <StatCard label="Total Net Earnings" value={formatPkr(totals.total_net)} />
          <StatCard label="Avg Commission Rate" value={`${toNumber(totals.avg_commission).toFixed(1)}%`} />
          <StatCard label="Avg Hourly Rate" value={`${formatPkr(toNumber(totals.avg_hourly).toFixed(0))}/hr`} />
        </div>

        {/* Monthly earnings chart */}
        <div className="rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6 shadow-[0_8px_24px_rgba(34,211,238,0.15)] backdrop-blur-lg animate-in-up">
          <h2 className="mb-4 text-lg font-semibold text-cyan-100">Monthly Income Breakdown (Last 6 Months)</h2>
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-cyan-200/60">No monthly data available yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#82caff' }} />
                <YAxis tick={{ fontSize: 12, fill: '#82caff' }} />
                <Tooltip 
                  formatter={(v) => formatPkr(v)}
                  contentStyle={{ background: 'rgba(7, 18, 40, 0.95)', border: '1px solid rgba(34, 211, 238, 0.4)', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2f3ff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="gross" name="Gross Earnings" fill={chartColors.gross} radius={[6,6,0,0]} />
                <Bar dataKey="net" name="Net Received" fill={chartColors.net} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Commission trend */}
        <div className="rounded-2xl border border-fuchsia-300/25 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6 shadow-[0_8px_24px_rgba(244,114,182,0.15)] backdrop-blur-lg animate-in-up">
          <h2 className="mb-4 text-lg font-semibold text-fuchsia-100">Commission Rate Trend 📈</h2>
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-fuchsia-200/60">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 114, 182, 0.1)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#f9a8d4' }} />
                <YAxis tick={{ fontSize: 12, fill: '#f9a8d4' }} />
                <Tooltip 
                  formatter={(v, name) => name === 'Hourly Rate (PKR)' ? formatPkr(v) : `${toNumber(v).toFixed(1)}%`}
                  contentStyle={{ background: 'rgba(7, 18, 40, 0.95)', border: '1px solid rgba(244, 114, 182, 0.4)', borderRadius: '8px' }}
                  labelStyle={{ color: '#f9a8d4' }}
                />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />
                <Line type="monotone" dataKey="commission" name="Commission %" stroke={chartColors.commission} strokeWidth={3} dot={{ fill: chartColors.commission, r: 5 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="hourly" name="Hourly Rate (PKR)" stroke={chartColors.hourly} strokeWidth={3} dot={{ fill: chartColors.hourly, r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform breakdown */}
        {platformChartData.length > 0 && (
          <div className="rounded-2xl border border-lime-300/25 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6 shadow-[0_8px_24px_rgba(132,204,22,0.15)] backdrop-blur-lg animate-in-up">
            <h2 className="mb-4 text-lg font-semibold text-lime-100">Earnings by Platform 🎯</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {platformChartData.map((p, i) => (
                <div key={i} className="rounded-lg border border-lime-300/20 bg-lime-950/20 p-4 transition-all hover:bg-lime-950/40 hover:border-lime-300/40">
                  <p className="text-sm font-semibold text-lime-100">{p.name}</p>
                  <p className="mt-2 text-xl font-bold text-lime-200">{formatPkr(p.earnings)}</p>
                  <p className="mt-1 text-xs text-lime-200/60">Avg Commission: {p.commission.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* City median comparison */}
        {medians.length > 0 && (
          <div className="rounded-2xl border border-orange-300/25 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6 shadow-[0_8px_24px_rgba(251,146,60,0.15)] backdrop-blur-lg animate-in-up">
            <h2 className="mb-4 text-lg font-semibold text-orange-100">Your Performance vs City Median 🏙️</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {medians.slice(0, 4).map((m, i) => (
                <div key={i} className="rounded-lg border border-orange-300/20 bg-orange-950/20 p-4">
                  <p className="text-sm font-semibold text-orange-100">{m.platform_name}</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="text-orange-200">City Median Commission: <span className="font-bold">{toNumber(m.median_commission).toFixed(1)}%</span></p>
                    {/* <p className="text-orange-300">Your Rate: PKR 1200/hr</p> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
