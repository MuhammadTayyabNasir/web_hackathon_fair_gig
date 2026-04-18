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
    <div className="min-h-screen text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-indigo-300/20 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-2xl font-black text-indigo-100">Fair<span className="bg-gradient-to-r from-cyan-300 via-indigo-200 to-fuchsia-300 bg-clip-text text-transparent">Gig</span></span>
          <div className="flex gap-3">
            <Link to="/login" title="Sign in to your account" className="rounded-lg border border-indigo-300/40 bg-indigo-500/12 px-4 py-2 text-sm font-semibold text-indigo-100 hover:bg-indigo-500/22">Login</Link>
            <Link to="/register" title="Create a new FairGig account" className="rounded-lg border border-cyan-300/40 bg-cyan-500/14 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/26">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="mb-4 inline-block rounded-full border border-indigo-300/40 bg-indigo-500/12 px-4 py-1.5 text-sm font-semibold text-indigo-100">
            Built for Pakistan's Gig Economy
            </span>
            <h1 className="text-4xl font-black leading-tight text-indigo-50 sm:text-6xl">
              Track Every Rupee.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-indigo-200 to-fuchsia-300 bg-clip-text text-transparent">Defend Every Right.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-indigo-100/85">
            FairGig gives delivery riders, ride-hailing drivers, and freelancers the tools to track income,
            detect platform abuse, and fight for fair pay — with data.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" title="Create account as worker" className="rounded-xl border border-cyan-300/45 bg-cyan-500/20 px-8 py-3 text-base font-semibold text-cyan-50 shadow-[0_10px_30px_rgba(14,165,233,0.3)] hover:bg-cyan-500/30">
              Join as Worker
              </Link>
              <Link to="/login" title="Use existing account" className="rounded-xl border border-indigo-300/45 bg-indigo-500/15 px-8 py-3 text-base font-semibold text-indigo-100 hover:bg-indigo-500/25">
              Login
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-300/30 bg-slate-900/55 p-5 shadow-[0_18px_45px_rgba(3,10,28,0.5)] backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-indigo-300/20 bg-slate-950/45 p-4">
                  <div className="text-2xl font-black text-indigo-100">{s.value}</div>
                  <div className="mt-1 text-xs text-indigo-100/70">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Live Impact</p>
              <p className="mt-2 text-sm text-cyan-50">Workers use FairGig to prove income drops, challenge unfair commissions, and generate trusted income certificates in minutes.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-indigo-300/20 bg-slate-950/45 py-12 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black text-indigo-100">{s.value}</div>
              <div className="mt-1 text-sm text-indigo-200/80">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-indigo-50">Everything you need to protect your income</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-indigo-300/20 bg-slate-900/55 p-6 shadow-[0_12px_35px_rgba(2,6,23,0.45)] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-indigo-300/45"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-bold text-indigo-50">{f.title}</h3>
              <p className="text-sm text-indigo-100/80">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-y border-indigo-300/25 bg-indigo-500/12 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-black text-indigo-50">Ready to take control?</h2>
          <p className="mt-4 text-indigo-100/90">Join thousands of gig workers using FairGig to understand and protect their earnings.</p>
          <Link to="/register" title="Register now" className="mt-6 inline-block rounded-xl border border-cyan-300/45 bg-cyan-500/20 px-8 py-3 text-base font-bold text-cyan-50 hover:bg-cyan-500/30">
            Sign Up Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-indigo-300/20 bg-slate-950/55 py-8 text-center text-sm text-indigo-100/70">
        © 2026 FairGig — SOFTEC'26 Hackathon Project
      </footer>
    </div>
  );
}
