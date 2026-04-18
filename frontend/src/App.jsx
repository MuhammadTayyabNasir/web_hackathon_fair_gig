import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth-store';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

NProgress.configure({ showSpinner: false, speed: 300 });

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-800 border-t-transparent" />
    </div>
  );
}

function NProgressHandler() {
  const location = useLocation();
  useEffect(() => {
    NProgress.start();
    const t = setTimeout(() => NProgress.done(), 300);
    return () => { clearTimeout(t); NProgress.done(); };
  }, [location.pathname]);
  return null;
}

// Lazy load pages
const LandingPage          = lazy(() => import('./pages/landing-page'));
const LoginPage            = lazy(() => import('./pages/login-page'));
const RegisterPage         = lazy(() => import('./pages/register-page'));
const WorkerDashboardPage  = lazy(() => import('./pages/worker-dashboard-page'));
const ShiftsPage           = lazy(() => import('./pages/shifts-page'));
const AddShiftPage         = lazy(() => import('./pages/add-shift-page'));
const ImportCsvPage        = lazy(() => import('./pages/import-csv-page'));
const WorkerAnalyticsPage  = lazy(() => import('./pages/worker-analytics-page'));
const CertificatePage      = lazy(() => import('./pages/certificate-page'));
const AnomaliesPage        = lazy(() => import('./pages/anomalies-page'));
const VerifierQueuePage    = lazy(() => import('./pages/verifier-queue-page'));
const VerifierReviewPage   = lazy(() => import('./pages/verifier-review-page'));
const AdvocateDashboardPage= lazy(() => import('./pages/advocate-dashboard-page'));
const AdvocateGrievancesPage= lazy(() => import('./pages/advocate-grievances-page'));
const CommunityPage        = lazy(() => import('./pages/community-page'));
const PublicCertPage       = lazy(() => import('./pages/public-cert-page'));
const NotFoundPage         = lazy(() => import('./pages/not-found-page'));

function RequireRole({ roles, children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <NProgressHandler />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cert/:token" element={<PublicCertPage />} />

          {/* Worker routes */}
          <Route path="/worker/dashboard" element={<RequireRole roles={['worker']}><WorkerDashboardPage /></RequireRole>} />
          <Route path="/worker/shifts" element={<RequireRole roles={['worker']}><ShiftsPage /></RequireRole>} />
          <Route path="/worker/shifts/add" element={<RequireRole roles={['worker']}><AddShiftPage /></RequireRole>} />
          <Route path="/worker/shifts/import" element={<RequireRole roles={['worker']}><ImportCsvPage /></RequireRole>} />
          <Route path="/worker/analytics" element={<RequireRole roles={['worker']}><WorkerAnalyticsPage /></RequireRole>} />
          <Route path="/worker/certificate" element={<RequireRole roles={['worker']}><CertificatePage /></RequireRole>} />
          <Route path="/worker/anomalies" element={<RequireRole roles={['worker']}><AnomaliesPage /></RequireRole>} />

          {/* Verifier routes */}
          <Route path="/verifier/queue" element={<RequireRole roles={['verifier']}><VerifierQueuePage /></RequireRole>} />
          <Route path="/verifier/review/:id" element={<RequireRole roles={['verifier']}><VerifierReviewPage /></RequireRole>} />

          {/* Advocate routes */}
          <Route path="/advocate/dashboard" element={<RequireRole roles={['advocate']}><AdvocateDashboardPage /></RequireRole>} />
          <Route path="/advocate/grievances" element={<RequireRole roles={['advocate']}><AdvocateGrievancesPage /></RequireRole>} />

          {/* Community (auth required) */}
          <Route path="/community" element={<RequireAuth><CommunityPage /></RequireAuth>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </>
  );
}
