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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-black tracking-tight text-blue-800 dark:text-blue-400">
            Fair<span className="text-green-600">Gig</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? 'bg-blue-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-500 sm:block">{user.name}</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-md bg-blue-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
