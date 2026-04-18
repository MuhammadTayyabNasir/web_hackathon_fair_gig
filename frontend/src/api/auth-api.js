const API_BASE = import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_URL || window.location.origin || 'http://localhost:3001';

function joinUrl(base, path) {
  const normalizedBase = String(base || '').trim();
  const normalizedPath = String(path || '').trim();

  if (!normalizedBase || normalizedBase === '/') {
    return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  }

  return `${normalizedBase.replace(/\/+$/, '')}/${normalizedPath.replace(/^\/+/, '')}`;
}

/**
 * Exchange Firebase ID token for FairGig JWT/session.
 * @param {{ idToken: string, role?: 'worker' | 'verifier' | 'advocate' }} payload
 */
export async function loginWithFirebase(payload) {
  const response = await fetch(joinUrl(API_BASE, '/api/v1/auth/firebase-login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Authentication failed');
  }
  return body;
}
