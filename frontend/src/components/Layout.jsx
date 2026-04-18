import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import toast from 'react-hot-toast';
import api from '../api/client';

const workerLinks = [
  { to: '/worker/dashboard', label: 'Dashboard' },
  { to: '/worker/shifts', label: 'My Shifts' },
  { to: '/worker/analytics', label: 'Analytics' },
  { to: '/worker/anomalies', label: 'Anomalies' },
  { to: '/worker/certificate', label: 'Certificate' },
  { to: '/community', label: 'Community' },
];
const verifierLinks = [
  { to: '/verifier/queue', label: 'Verification Queue' },
  { to: '/community', label: 'Community' },
];
const advocateLinks = [
  { to: '/advocate/dashboard', label: 'Analytics' },
  { to: '/advocate/grievances', label: 'Grievances' },
  { to: '/community', label: 'Community' },
];

export default function Layout({ children }) {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  const location = useLocation();

  const links = user?.role === 'worker' ? workerLinks
              : user?.role === 'verifier' ? verifierLinks
              : user?.role === 'advocate' ? advocateLinks : [];

  async function handleLogout() {
    try { await api.post('/api/v1/auth/logout'); } catch { /* ignore */ }
    clearSession();
    toast.success('Logged out');
    navigate('/login');
  }

  const canGoBack = location.pathname !== '/'
    && location.pathname !== '/worker/dashboard'
    && location.pathname !== '/verifier/queue'
    && location.pathname !== '/advocate/dashboard';

  return (
    <div className="min-h-screen app-shell text-slate-100">
      <header className="sticky top-0 z-50 border-b border-indigo-300/20 bg-slate-950/70 shadow-[0_16px_36px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl font-black tracking-tight text-indigo-100 drop-shadow-[0_0_10px_rgba(91,140,255,0.55)]" title="Go to home">
              Fair<span className="bg-gradient-to-r from-cyan-300 via-indigo-200 to-fuchsia-300 bg-clip-text text-transparent">Gig</span>
            </Link>
            {user && (
              <span className="hidden rounded-full border border-indigo-300/45 bg-indigo-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-100 md:inline-block">
                {user.role} zone
              </span>
            )}
          </div>

          <nav className="hidden gap-2 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                title={`Open ${l.label}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
                  location.pathname === l.to
                    ? 'border border-indigo-300/45 bg-indigo-500/22 text-indigo-50 shadow-[0_0_18px_rgba(91,140,255,0.45)]'
                    : 'border border-transparent text-slate-200/90 hover:border-indigo-300/30 hover:bg-indigo-400/10 hover:text-indigo-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-indigo-100/85 sm:block">{user.name}</span>
                <span className="rounded-full border border-fuchsia-300/45 bg-fuchsia-500/16 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-fuchsia-100">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign out of your account"
                  className="rounded-lg border border-rose-300/55 bg-rose-500/16 px-3 py-1.5 text-sm font-semibold text-rose-100 transition-colors hover:bg-rose-500/28"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-lg border border-indigo-300/50 bg-indigo-500/18 px-4 py-1.5 text-sm font-semibold text-indigo-100 hover:bg-indigo-500/30" title="Login to your account">
                Login
              </Link>
            )}
          </div>
        </div>

        {user && (
          <div className="mx-auto max-w-7xl border-t border-cyan-300/15 px-4 py-2 md:hidden">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {links.map((l) => (
                <Link
                  key={`mobile-${l.to}`}
                  to={l.to}
                  title={`Open ${l.label}`}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    location.pathname === l.to
                      ? 'bg-indigo-500/25 text-indigo-100'
                      : 'bg-slate-900/45 text-slate-200 hover:bg-indigo-500/15 hover:text-indigo-100'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-indigo-300/20 bg-slate-900/45 px-3 py-2 backdrop-blur-md">
          {canGoBack ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              title="Go to previous page"
              className="rounded-full border border-indigo-300/45 bg-indigo-500/14 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-100 hover:bg-indigo-500/24"
            >
              ← Back
            </button>
          ) : <span />}
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/65">FairGig Operations</p>
        </div>
        <div className="page-shell">{children}</div>
      </main>
    </div>
  );
}
