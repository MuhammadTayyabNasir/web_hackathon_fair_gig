import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  { icon: '📊', title: 'Income Analytics', desc: 'Track earnings, commissions, and hourly rates across platforms with detailed charts.' },
  { icon: '🤖', title: 'Anomaly Detection', desc: 'AI-powered z-score analysis flags unusual deductions, income drops, and platform spikes.' },
  { icon: '📄', title: 'Income Certificate', desc: 'Generate print-ready income certificates for loans, visas, and financial applications.' },
  { icon: '📢', title: 'Grievance Platform', desc: 'Anonymous complaint board with clustering, tagging, and escalation to advocates.' },
  { icon: '✅', title: 'Shift Verification', desc: 'Community verifiers review uploaded screenshots to validate your earnings records.' },
  { icon: '🌆', title: 'City Medians', desc: 'Compare your rates against anonymised city-wide medians — never unfair, always data-backed.' },
];

const stats = [
  { value: '15,000+', label: 'Gig Workers' },
  { value: 'PKR 2.4M+', label: 'Verified Earnings' },
  { value: '3 Cities', label: 'Lahore • Karachi • Islamabad' },
  { value: '6 Platforms', label: 'Careem • Uber • foodpanda & more' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-2xl font-black text-blue-800">Fair<span className="text-green-600">Gig</span></span>
          <div className="flex gap-3">
            <Link to="/login" className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Login</Link>
            <Link to="/register" className="rounded-md bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-800">
            Built for Pakistan's Gig Economy
          </span>
          <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-6xl">
            Your Earnings.<br />
            <span className="text-blue-800">Your Rights.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            FairGig gives delivery riders, ride-hailing drivers, and freelancers the tools to track income,
            detect platform abuse, and fight for fair pay — with data.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/register" className="rounded-xl bg-blue-800 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700">
              Join as Worker
            </Link>
            <Link to="/login" className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50">
              Login
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-blue-800 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="mt-1 text-sm text-blue-200">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Everything you need to protect your income</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-600 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-black text-white">Ready to take control?</h2>
          <p className="mt-4 text-green-100">Join thousands of gig workers using FairGig to understand and protect their earnings.</p>
          <Link to="/register" className="mt-6 inline-block rounded-xl bg-white px-8 py-3 text-base font-bold text-green-700 hover:bg-green-50">
            Sign Up Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        © 2026 FairGig — SOFTEC'26 Hackathon Project
      </footer>
    </div>
  );
}
