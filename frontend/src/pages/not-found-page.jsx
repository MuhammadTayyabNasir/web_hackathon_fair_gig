import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="text-7xl font-black text-slate-200">404</div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6 rounded-xl bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
        ← Back to Home
      </Link>
    </div>
  );
}
