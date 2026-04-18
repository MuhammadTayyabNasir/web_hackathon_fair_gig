import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { loginWithFirebase } from '../api/auth-api';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/auth-store';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  function mapFirebaseLoginError(err) {
    const code = err?.code || '';
    const message = err?.message || '';
    if (code === 'auth/invalid-api-key') return 'Firebase API key is invalid. Check VITE_FIREBASE_API_KEY.';
    if (code === 'auth/invalid-credential') return 'Invalid email or password.';
    if (code === 'auth/user-disabled') return 'This account has been disabled.';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'Google sign-in was cancelled.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Try again in a few minutes.';
    if (/too many/i.test(message)) return 'Too many login attempts. Please wait a few minutes and try again.';
    if (/invalid firebase token/i.test(message)) return 'Session verification failed. Please try logging in again.';
    return message || 'Login failed';
  }

  async function onSubmit(data) {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const idToken = await credential.user.getIdToken();
      const authResponse = await loginWithFirebase({ idToken });

      setSession(authResponse.data);
      toast.success(`Welcome back, ${authResponse.data.user.name}!`);
      const role = authResponse.data.user.role;
      navigate(role === 'worker' ? '/worker/dashboard' : role === 'verifier' ? '/verifier/queue' : '/advocate/dashboard');
    } catch (err) {
      toast.error(mapFirebaseLoginError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const idToken = await credential.user.getIdToken();
      const authResponse = await loginWithFirebase({ idToken });
      setSession(authResponse.data);
      toast.success(`Welcome back, ${authResponse.data.user.name}!`);
      const role = authResponse.data.user.role;
      navigate(role === 'worker' ? '/worker/dashboard' : role === 'verifier' ? '/verifier/queue' : '/advocate/dashboard');
    } catch (err) {
      toast.error(mapFirebaseLoginError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-3xl font-black text-cyan-200">Fair<span className="text-fuchsia-300">Gig</span></Link>
          <h1 className="mt-4 text-2xl font-bold text-cyan-50">Welcome back</h1>
          <p className="mt-1 text-sm text-cyan-100/80">
            Don't have an account? <Link to="/register" className="text-fuchsia-200 hover:underline">Register</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-cyan-300/25 bg-slate-900/60 p-8 shadow-[0_15px_45px_rgba(2,6,23,0.45)] backdrop-blur-lg">
          <div>
            <label className="mb-1 block text-sm font-medium text-cyan-100">Email</label>
            <input {...register('email')} type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" placeholder="you@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-cyan-100">Password</label>
            <input {...register('password')} type="password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={loading} title="Sign in with email and password"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            title="Sign in using Google"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-300/35 bg-fuchsia-500/10 py-3 text-sm font-semibold text-fuchsia-100 hover:bg-fuchsia-500/20 disabled:opacity-60"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
