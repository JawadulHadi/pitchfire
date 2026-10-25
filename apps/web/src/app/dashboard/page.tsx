'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Dashboard() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ id: string; pages: number; enqueued: string } | null>(null);
  const [userId] = useState('demo-user-123'); // Phase 5: replace with Supabase auth

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const res = await fetch(`${API_URL}/resume/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert(String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl mb-1 tracking-tight">
          Dashboard
        </h1>
        <p className="text-secondary">Upload your resume to start the pipeline</p>
      </div>

      {/* Resume Upload */}
      <div className="glass sweep rounded-xl p-6 space-y-4">
        <h2 className="eyebrow">Resume upload</h2>
        <label className="block border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] rounded-lg p-8 text-center cursor-pointer transition-colors">
          <input
            type="file"
            accept=".pdf,.txt,.md"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading ? (
            <span className="accent font-medium">Uploading and parsing...</span>
          ) : (
            <span className="text-secondary">
              Drop your resume PDF here or{' '}
              <span className="accent font-medium">click to browse</span>
            </span>
          )}
        </label>

        {result && (
          <div className="accent-bg rounded-lg p-4 text-sm">
            <div
              className="chip"
              style={{ '--tone': 'var(--tone-ok)' } as React.CSSProperties}
            >
              Resume uploaded
            </div>
            <div className="text-secondary mt-2 font-mono text-xs">
              ID: {result.id} · {result.pages} page(s) · {result.enqueued} agent queued
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Jobs Matched', value: '—', action: '/jobs', tone: 'var(--tone-blue)' },
          { label: 'Applications', value: '—', action: '/applications', tone: 'var(--tone-teal)' },
          { label: 'Interviews', value: '—', action: '/sessions', tone: 'var(--tone-violet)' },
          { label: 'Offers', value: '—', action: '/sessions', tone: 'var(--accent)' },
        ].map((stat) => (
          <a
            key={stat.label}
            href={stat.action}
            className="glass kpi sweep rounded-xl"
            style={{ '--tone': stat.tone } as React.CSSProperties}
          >
            <span className="kpi-bar" />
            <span className="eyebrow">{stat.label}</span>
            <span className="kpi-fig">{stat.value}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
