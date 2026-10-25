"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const AGENCY_ID = "demo-agency-id"; // replaced by Supabase auth context in production

interface Member {
  id: string;
  member_user_id: string;
  label: string | null;
  is_active: boolean;
  email?: string;
  full_name?: string;
  applications_this_month?: number;
}

interface BulkStat {
  member_user_id: string;
  label: string;
  stats: Record<string, number>;
}

export default function AgencyPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<BulkStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState("");
  const [addLabel, setAddLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [mRes, sRes] = await Promise.all([
        fetch(`${API}/agency/${AGENCY_ID}/members`),
        fetch(`${API}/agency/${AGENCY_ID}/bulk-apply-status`),
      ]);
      setMembers(await mRes.json());
      setStats(await sRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addMember = async () => {
    if (!addEmail.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const r = await fetch(`${API}/agency/${AGENCY_ID}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail, label: addLabel || undefined }),
      });
      if (!r.ok) {
        const { message } = await r.json();
        setError(message ?? "Failed to add member.");
      } else {
        setAddEmail("");
        setAddLabel("");
        await load();
      }
    } finally {
      setAdding(false);
    }
  };

  const deactivate = async (memberId: string) => {
    await fetch(`${API}/agency/${AGENCY_ID}/members/${memberId}`, {
      method: "DELETE",
    });
    await load();
  };

  const statMap = Object.fromEntries(
    stats.map((s) => [s.member_user_id, s.stats]),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Agency Dashboard</h1>
        <p className="text-secondary mt-1">Manage up to 10 candidate profiles</p>
      </div>

      {/* Add member */}
      <div className="glass rounded-xl p-5">
        <h2 className="text-sm font-semibold text-secondary mb-3">
          Add Candidate Profile
        </h2>
        <div className="flex gap-3 flex-wrap">
          <input
            type="email"
            placeholder="candidate@email.com"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            className="flex-1 min-w-[200px] bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-primary placeholder-[var(--text-3)] focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Label (e.g. Client A)"
            value={addLabel}
            onChange={(e) => setAddLabel(e.target.value)}
            className="w-40 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-primary placeholder-[var(--text-3)] focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addMember}
            disabled={adding || !addEmail}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Members table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-secondary">
            Profiles ({members.filter((m) => m.is_active).length} / 10 active)
          </h2>
          <span className="text-xs text-muted">{members.length} total</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted text-sm">Loading…</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">
            No profiles yet. Add a candidate above.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-muted text-xs uppercase">
              <tr className="border-b border-[var(--border)]">
                <th className="px-5 py-3 text-left">Profile</th>
                <th className="px-5 py-3 text-left">Applied</th>
                <th className="px-5 py-3 text-left">Replied</th>
                <th className="px-5 py-3 text-left">Interviews</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const s = statMap[m.member_user_id] ?? {};
                return (
                  <tr
                    key={m.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-primary">
                        {m.label ?? m.full_name ?? "Profile"}
                      </div>
                      <div className="text-muted text-xs">{m.email}</div>
                    </td>
                    <td className="px-5 py-3 text-secondary">
                      {s.applied ?? 0}
                    </td>
                    <td className="px-5 py-3 text-secondary">
                      {s.replied ?? 0}
                    </td>
                    <td className="px-5 py-3 text-secondary">
                      {s.interview ?? 0}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          m.is_active
                            ? "bg-green-900 text-green-300"
                            : "bg-[var(--bg-surface)] text-muted"
                        }`}
                      >
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {m.is_active && (
                        <button
                          onClick={() => deactivate(m.id)}
                          className="text-xs text-muted hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
