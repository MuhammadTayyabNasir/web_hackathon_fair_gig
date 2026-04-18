import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { loginWithFirebase } from '../api/auth-api';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/auth-store';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password min 6 chars'),
  role: z.enum(['worker', 'verifier', 'advocate']),
});

const roles = [
  { value: 'worker', label: 'Worker', desc: 'Delivery riders, drivers, freelancers' },
  { value: 'verifier', label: 'Verifier', desc: 'Review and verify shift screenshots' },
  { value: 'advocate', label: 'Advocate', desc: 'Analyze trends and escalate issues' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'worker' },
  });

  const selectedRole = watch('role');

  function mapFirebaseRegisterError(err) {
    const code = err?.code || '';
    const message = err?.message || '';
    if (code === 'auth/invalid-api-key') return 'Firebase API key is invalid. Check VITE_FIREBASE_API_KEY.';
    if (code === 'auth/unauthorized-domain') return `This domain is not authorized for Google login. Add "${window.location.hostname}" in Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    if (code === 'auth/email-already-in-use') return 'An account already exists with this email.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/weak-password') return 'Password is too weak. Use at least 6 characters.';
    if (code === 'auth/operation-not-allowed') return 'Email/password sign-up is disabled in Firebase Auth settings.';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'Google sign-in was cancelled.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait and try again.';
    if (/too many/i.test(message)) return 'Too many registration attempts. Please wait a few minutes and try again.';
    if (/invalid firebase token/i.test(message)) return 'Account created, but session verification failed. Please try logging in.';
    return message || 'Registration failed';
  }

  async function onSubmit(data) {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(credential.user, { displayName: data.name });
      const idToken = await credential.user.getIdToken();
      const authResponse = await loginWithFirebase({ idToken, role: data.role });

      setSession(authResponse.data);
      toast.success('Welcome to FairGig!');
      const role = authResponse.data.user.role;
      navigate(role === 'worker' ? '/worker/dashboard' : role === 'verifier' ? '/verifier/queue' : '/advocate/dashboard');
    } catch (err) {
      toast.error(mapFirebaseRegisterError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setLoading(true);
    try {
      const currentRole = watch('role');
      const credential = await signInWithPopup(auth, googleProvider);
      if (!credential.user.displayName) {
        await updateProfile(credential.user, { displayName: credential.user.email?.split('@')[0] || 'FairGig User' });
      }
      const idToken = await credential.user.getIdToken();
      const authResponse = await loginWithFirebase({ idToken, role: currentRole });
      setSession(authResponse.data);
      toast.success('Welcome to FairGig!');
      const role = authResponse.data.user.role;
      navigate(role === 'worker' ? '/worker/dashboard' : role === 'verifier' ? '/verifier/queue' : '/advocate/dashboard');
    } catch (err) {
      toast.error(mapFirebaseRegisterError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-3xl font-black text-cyan-200">Fair<span className="text-fuchsia-300">Gig</span></Link>
          <h1 className="mt-4 text-2xl font-bold text-cyan-50">Create your account</h1>
          <p className="mt-1 text-sm text-cyan-100/80">Already have an account? <Link to="/login" className="text-fuchsia-200 hover:underline">Log in</Link></p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-cyan-300/25 bg-slate-900/60 p-8 shadow-[0_15px_45px_rgba(2,6,23,0.45)] backdrop-blur-lg">
          {/* Role selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-cyan-100">I am a...</label>
            <div className="grid gap-3">
              {roles.map((r) => (
                <label
                  key={r.value}
                  title={`Choose ${r.label} role`}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-colors ${
                    selectedRole === r.value ? 'border-cyan-300/70 bg-cyan-500/15' : 'border-cyan-300/20 hover:border-cyan-300/45'
                  }`}
                >
                  <input type="radio" className="mt-0.5" value={r.value} {...register('role')} />
                  <div>
                    <div className="font-semibold text-cyan-50">{r.label}</div>
                    <div className="text-xs text-cyan-100/70">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-cyan-100">Full Name</label>
            <input {...register('name')} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" placeholder="Ali Khan" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-cyan-100">Email</label>
            <input {...register('email')} type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" placeholder="ali@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-cyan-100">Password</label>
            <input {...register('password')} type="password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            title="Create account using email and password"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading}
            title="Create account using Google"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-300/35 bg-fuchsia-500/10 py-3 text-sm font-semibold text-fuchsia-100 hover:bg-fuchsia-500/20 disabled:opacity-60"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
