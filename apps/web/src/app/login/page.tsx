'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LogoIcon } from '@/components/Logo';

type Tab = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setSuccess('Check your email to confirm your account, then sign in.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.replace('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <LogoIcon size={48} />
          <h1 className="font-display font-extrabold text-2xl mt-4 tracking-tight" style={{ color: 'var(--text-1)' }}>
            PitchFire
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
            Autonomous AI Job Search Orchestrator
          </p>
        </div>

        {/* Card */}
        <div className="glass sweep rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--border)] mb-6">
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  background: tab === t ? 'var(--accent)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--text-2)',
                }}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="eyebrow block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg px-4 py-2.5 text-sm border border-[var(--border)] focus:border-[var(--accent)] outline-none transition-colors"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-1)' }}
              />
            </div>
            <div>
              <label className="eyebrow block mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-2.5 text-sm border border-[var(--border)] focus:border-[var(--accent)] outline-none transition-colors"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-1)' }}
              />
              {tab === 'signup' && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Minimum 8 characters</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg px-4 py-2.5 text-sm" style={{ background: 'rgba(255,99,105,0.12)', border: '1px solid rgba(255,99,105,0.3)', color: 'var(--tone-bad)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg px-4 py-2.5 text-sm" style={{ background: 'rgba(61,214,140,0.12)', border: '1px solid rgba(61,214,140,0.3)', color: 'var(--tone-ok)' }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-opacity"
              style={{ background: 'var(--accent)', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (tab === 'signup' ? 'Creating account…' : 'Signing in…') : (tab === 'signup' ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-3)' }}>
            By signing up you agree to our{' '}
            <Link href="/" style={{ color: 'var(--text-2)' }} className="hover:text-[var(--text-1)]">Terms</Link>
          </p>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-3)' }}>
          <Link href="/" style={{ color: 'var(--text-2)' }} className="hover:text-[var(--text-1)]">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
