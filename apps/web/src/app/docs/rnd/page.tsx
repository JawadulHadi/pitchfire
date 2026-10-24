import Link from 'next/link';

export const metadata = {
  title: 'Designing for AI Failure — PitchFire R&D',
  description:
    'How PitchFire handles autonomous agent failure: confidence gates, human approval gates, and DLQ recovery.',
};

export default function RndCaseStudyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link href="/" style={{ color: 'var(--accent)' }} className="text-sm font-semibold hover:opacity-80">
        ← Back to home
      </Link>

      <h1 className="text-4xl font-bold mt-6 mb-6" style={{ color: 'var(--text-1)' }}>
        Designing for AI Failure
      </h1>

      <p className="text-lg mb-6" style={{ color: 'var(--text-2)' }}>
        PitchFire runs seven autonomous agents end to end: discovery, scoring, tailoring,
        apply, inbox triage, and interview booking. Every one of those steps can produce a
        wrong answer, so the architecture assumes failure rather than hoping it never
        happens.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-3" style={{ color: 'var(--text-1)' }}>
        Confidence gates
      </h2>
      <p className="mb-6" style={{ color: 'var(--text-2)' }}>
        Every model output that drives an irreversible action — submitting an application,
        booking an interview — carries a confidence score. Anything below 0.8 is routed to a
        human flag instead of executing automatically. The gate is deliberately conservative:
        a missed automation is cheap, a bad autonomous action is not.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-3" style={{ color: 'var(--text-1)' }}>
        Human approval gates
      </h2>
      <p className="mb-6" style={{ color: 'var(--text-2)' }}>
        Resume tailoring and job applications pass through a review queue before they leave
        the system. The agent does the work; the user keeps the final call on anything sent
        to an employer.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-3" style={{ color: 'var(--text-1)' }}>
        DLQ recovery
      </h2>
      <p className="mb-6" style={{ color: 'var(--text-2)' }}>
        Agent jobs run through BullMQ. A job that fails is retried with backoff; after the
        third failure it lands in a dead-letter queue rather than silently dropping, so
        nothing is lost and every failure is inspectable and replayable.
      </p>

      <p className="mt-10 text-sm" style={{ color: 'var(--text-3)' }}>
        This is a living case study — it documents the architecture as built, not an idealized
        version of it.
      </p>
    </div>
  );
}
