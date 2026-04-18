import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const CERT_BASE = import.meta.env.VITE_CERT_URL || 'http://localhost:8002';

export default function PublicCertPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const certUrl = `${CERT_BASE}/cert/${token}`;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <a href="/" className="text-xl font-black text-blue-800">Fair<span className="text-green-600">Gig</span></a>
          <a href={certUrl} target="_blank" rel="noreferrer"
            className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Open in New Tab / Print
          </a>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg bg-white">
          <iframe
            src={certUrl}
            title="Income Certificate"
            className="w-full"
            style={{ minHeight: '90vh', border: 'none' }}
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError(true); }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-800 border-t-transparent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
