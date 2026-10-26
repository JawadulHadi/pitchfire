'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import type { Route } from 'next';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from './ThemeToggle';

const AUTHED_NAV: { label: string; href: Route }[] = [
  { label: 'Dashboard', href: '/dashboard' as Route },
  { label: 'Jobs', href: '/jobs' as Route },
  { label: 'Review', href: '/review' as Route },
  { label: 'Applications', href: '/applications' as Route },
  { label: 'Billing', href: '/billing' as Route },
];

export function NavAuthSection() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/' as Route);
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <div className="hidden md:flex gap-5 text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            {AUTHED_NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-[var(--text-1)]"
                style={pathname === l.href ? { color: 'var(--accent)' } : undefined}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 text-sm rounded-lg px-3 py-1.5 transition-colors hover:bg-[var(--bg-surface-hover)]"
              style={{ color: 'var(--text-2)' }}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                {user.email?.[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="hidden sm:inline max-w-[120px] truncate">{user.email}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 glass rounded-lg overflow-hidden z-50 shadow-lg">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-surface-hover)]"
                  style={{ color: 'var(--tone-bad)' }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <Link
          href={"/login" as Route}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          Sign In
        </Link>
      )}
      <ThemeToggle />
    </div>
  );
}
