'use client';

import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="flex justify-center mb-8">
          <LogoIcon size={72} />
        </div>
        <div className="inline-block accent-bg text-xs px-3 py-1 rounded-full mb-6 font-medium" style={{ color: 'var(--accent)' }}>
          Designing for AI Failure — confidence gates · approval gates · DLQ recovery
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-6" style={{ color: 'var(--text-1)' }}>
          Your job search,<br />
          <span style={{ color: 'var(--accent)' }}>fully automated.</span>
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-2)' }}>
          Upload your resume once. PitchFire discovers matched jobs, tailors every application,
          submits autonomously, tracks replies, and books your interviews.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 rounded-lg font-semibold transition-colors text-white"
            style={{ background: 'var(--accent)' }}
          >
            Start for Free
          </Link>
          <a
            href="#pricing"
            className="glass px-8 py-3 rounded-lg font-semibold transition-colors"
            style={{ color: 'var(--text-2)' }}
          >
            See Pricing
          </a>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
          {[
            { value: '83%', label: 'Latency reduction (12s → 2s per job match)' },
            { value: '99.9%', label: 'Uptime via DLQ + confidence gates' },
            { value: '10+', label: 'Job boards scraped continuously' },
          ].map(m => (
            <div key={m.label} className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{m.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="glass-section py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--text-1)' }}>
            A platform, not a wrapper
          </h2>
          <p className="text-center mb-14 max-w-2xl mx-auto" style={{ color: 'var(--text-2)' }}>
            Each agent owns a domain, communicates via BullMQ, and plugs into your stack.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="glass p-6">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-1)' }}>{f.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--text-1)' }}>
          Profitable from user #2
        </h2>
        <p className="text-center mb-14" style={{ color: 'var(--text-2)' }}>
          Break-even: 2 Pro subscribers ($58/mo) &gt; $50/mo infra.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div
              key={p.name}
              className={`glass p-6 ${p.highlighted ? 'border-[var(--accent)]' : ''}`}
              style={p.highlighted ? { borderColor: 'var(--accent)' } : {}}
            >
              {p.highlighted && (
                <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
                  Most Popular
                </div>
              )}
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-1)' }}>{p.name}</h3>
              <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>
                {p.price}
                <span className="text-base font-normal" style={{ color: 'var(--text-3)' }}>/mo</span>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>{p.tagline}</p>
              <ul className="space-y-2 mb-8">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-2)' }}>
                    <span className="text-green-400 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={p.cta.href}
                className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                  p.highlighted ? 'text-white' : 'glass'
                }`}
                style={p.highlighted ? { background: 'var(--accent)' } : { color: 'var(--text-2)' }}
              >
                {p.cta.label}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Case Study CTA */}
      <section className="glass-section py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-1)' }}>
            Designing for AI Failure
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-2)' }}>
            Every autonomous action has a fallback. Confidence &lt; 0.8 → user flag.
            Every application reviewed before submit. DLQ replay on 3rd failure.
            Read the full reasoning behind the architecture.
          </p>
          <Link href="/docs/rnd" style={{ color: 'var(--accent)' }} className="font-semibold transition-colors hover:opacity-80">
            Read the R&amp;D case study →
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm" style={{ color: 'var(--text-3)', borderTop: '1px solid var(--border)' }}>
        Built by{' '}
        <a href="https://github.com/JawadulHadi" style={{ color: 'var(--text-2)' }} className="hover:text-[var(--text-1)] transition-colors">
          Jawad Ul Hadi
        </a>{' '}
        · Backend Lead / AI Systems Architect · MIT License
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: '🔍',
    title: 'Continuous Job Discovery',
    desc: '10+ boards scraped with Playwright stealth. RemoteOK, Wellfound, Greenhouse, Lever, Workday — fresh every cycle.',
  },
  {
    icon: '🎯',
    title: 'Semantic Match Scoring',
    desc: 'voyage-3-lite 1024-dim pgvector cosine similarity. Your resume embedded once; every new job scored in <50ms.',
  },
  {
    icon: '✍️',
    title: 'AI Resume Tailoring',
    desc: 'Claude Sonnet 4.6 generates a targeted variant per application. Score-gated critique loop exits when quality ≥ 0.8.',
  },
  {
    icon: '🤖',
    title: 'Autonomous Apply',
    desc: 'Playwright headless form-fill with ATS-specific playbooks. Every application gated by your approval before submit.',
  },
  {
    icon: '📬',
    title: 'Inbox Intelligence',
    desc: 'Gmail tool-use loop classifies every reply: interview invite, rejection, offer, followup. Auto-updates pipeline.',
  },
  {
    icon: '📅',
    title: 'Interview Booking',
    desc: 'Confidence gate: < 0.8 → flag for user. Google Calendar event + Sonnet-generated personalised prep notes.',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    tagline: 'Try the full pipeline',
    highlighted: false,
    features: [
      '10 applications / month',
      '3 job boards',
      'AI resume scoring',
      'Manual apply',
    ],
    cta: { label: 'Get Started', href: '/login' },
  },
  {
    name: 'Pro',
    price: '$29',
    tagline: 'Unlimited autonomous apply',
    highlighted: true,
    features: [
      'Unlimited applications',
      '15+ job boards',
      'AI resume tailoring',
      'Autonomous apply',
      'Inbox intelligence',
      'Interview prep notes',
      'Analytics dashboard',
    ],
    cta: { label: 'Upgrade to Pro', href: '/login' },
  },
  {
    name: 'Agency',
    price: '$99',
    tagline: 'Manage 10 candidate profiles',
    highlighted: false,
    features: [
      'Everything in Pro',
      '10 candidate profiles',
      'Bulk apply dashboard',
      'White-label ready',
      'Agency analytics',
    ],
    cta: { label: 'Contact Sales', href: 'mailto:hello@pitchfire.io' },
  },
];
