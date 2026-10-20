#!/usr/bin/env node
/**
 * PitchFire Local MCP Server
 *
 * Exposes the PitchFire job-search pipeline as MCP tools that Claude (or any
 * MCP-compatible client) can call directly:
 *
 *   get_pipeline_status   — full funnel for a user
 *   list_applications     — paginated application list with status
 *   list_sessions         — upcoming + past interview sessions
 *   list_matched_jobs     — top matched jobs for a user
 *   approve_application   — approve a tailored application for submission
 *   withdraw_application  — withdraw an application from the queue
 *   trigger_scout         — kick off ScoutAgent for a user
 *   get_analytics         — funnel stats + weekly activity
 *   get_job_detail        — full job listing by id
 *   get_session_detail    — session detail with prep notes
 *
 * Add to Claude Code:
 *   claude mcp add --scope project pitchfire-local \
 *     node $(pwd)/apps/mcp-server/dist/index.js
 *
 * Or add to .claude/settings.json:
 *   { "mcpServers": { "pitchfire": { "type": "stdio", "command": "node",
 *       "args": ["apps/mcp-server/dist/index.js"] } } }
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import { Redis as IORedis } from 'ioredis';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Infrastructure
// ---------------------------------------------------------------------------

function getDb(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  return createClient(url, key);
}

function getRedis(): IORedis {
  return new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
  });
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name:    'pitchfire',
  version: '0.1.0',
});

// ---------------------------------------------------------------------------
// Tool: get_pipeline_status
// ---------------------------------------------------------------------------
server.tool(
  'get_pipeline_status',
  'Get the full job-search funnel status for a user — counts at each pipeline stage.',
  { userId: z.string().describe('Supabase user UUID') },
  async ({ userId }) => {
    const db = getDb();
    const { data: apps } = await db
      .from('applications')
      .select('status')
      .eq('user_id', userId);

    const counts: Record<string, number> = {};
    for (const app of apps ?? []) {
      counts[app.status] = (counts[app.status] ?? 0) + 1;
    }

    const { data: jobs } = await db
      .from('job_listings')
      .select('id', { count: 'exact', head: true });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          userId,
          total_jobs_scouted:   jobs?.length ?? 0,
          applications_by_status: counts,
          total_applications: apps?.length ?? 0,
        }, null, 2),
      }],
    };
  },
);

// ---------------------------------------------------------------------------
// Tool: list_applications
// ---------------------------------------------------------------------------
server.tool(
  'list_applications',
  'List applications for a user with status, company, and match score.',
  {
    userId: z.string().describe('Supabase user UUID'),
    status: z.string().optional().describe('Filter by status (e.g. awaiting_approval, applied, replied)'),
    limit:  z.number().min(1).max(100).default(20).describe('Max results'),
  },
  async ({ userId, status, limit }) => {
    const db = getDb();
    let query = db
      .from('applications')
      .select('id, status, match_score, created_at, job_listings(title, company, url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return {
      content: [{ type: 'text', text: JSON.stringify(data ?? [], null, 2) }],
    };
  },
);

// ---------------------------------------------------------------------------
// Tool: list_matched_jobs
// ---------------------------------------------------------------------------
server.tool(
  'list_matched_jobs',
  'List top matched jobs for a user sorted by match score.',
  {
    userId: z.string().describe('Supabase user UUID'),
    limit:  z.number().min(1).max(50).default(10),
  },
  async ({ userId, limit }) => {
    const db = getDb();
    const { data, error } = await db
      .from('applications')
      .select('match_score, job_listings(id, title, company, location, url, board, salary_range, created_at)')
      .eq('user_id', userId)
      .order('match_score', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return { content: [{ type: 'text', text: JSON.stringify(data ?? [], null, 2) }] };
  },
);

// ---------------------------------------------------------------------------
// Tool: get_job_detail
// ---------------------------------------------------------------------------
server.tool(
  'get_job_detail',
  'Get full job listing details including description.',
  { jobId: z.string().describe('Job listing UUID') },
  async ({ jobId }) => {
    const db = getDb();
    const { data, error } = await db
      .from('job_listings')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw new Error(error.message);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ---------------------------------------------------------------------------
// Tool: approve_application
// ---------------------------------------------------------------------------
server.tool(
  'approve_application',
  'Approve a tailored application for autonomous submission. Enqueues it to the apply-queue.',
  { applicationId: z.string().describe('Application UUID') },
  async ({ applicationId }) => {
    const apiUrl = process.env.API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/apply/${applicationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Approve failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ---------------------------------------------------------------------------
// Tool: withdraw_application
// ---------------------------------------------------------------------------
server.tool(
  'withdraw_application',
  'Withdraw an application — removes it from the approval queue.',
  { applicationId: z.string().describe('Application UUID') },
  async ({ applicationId }) => {
    const apiUrl = process.env.API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/apply/${applicationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'withdraw' }),
    });

    if (!res.ok) throw new Error(`Withdraw failed (${res.status})`);
    const data = await res.json();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ---------------------------------------------------------------------------
// Tool: trigger_scout
// ---------------------------------------------------------------------------
server.tool(
  'trigger_scout',
  'Trigger ScoutAgent to scrape jobs and start the scoring pipeline for a user.',
  {
    userId:   z.string().describe('Supabase user UUID'),
    resumeId: z.string().describe('Resume UUID to match against'),
  },
  async ({ userId, resumeId }) => {
    const redis = getRedis();
    const queue = new Queue('discovery-queue', { connection: redis });

    await queue.add('scout', { type: 'scout', userId, resumeId });
    await queue.close();
    await redis.quit();

    return {
      content: [{ type: 'text', text: JSON.stringify({ queued: true, userId, resumeId, queue: 'discovery-queue' }) }],
    };
  },
);

// ---------------------------------------------------------------------------
// Tool: list_sessions
// ---------------------------------------------------------------------------
server.tool(
  'list_sessions',
  'List interview sessions for a user — includes prep notes and calendar event URL.',
  {
    userId:   z.string().describe('Supabase user UUID'),
    upcoming: z.boolean().default(true).describe('true = upcoming only, false = all'),
  },
  async ({ userId, upcoming }) => {
    const db = getDb();
    let query = db
      .from('sessions')
      .select('id, scheduled_at, type, google_calendar_event_id, prep_notes, applications(job_listings(title, company))')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: true });

    if (upcoming) {
      query = query.gte('scheduled_at', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { content: [{ type: 'text', text: JSON.stringify(data ?? [], null, 2) }] };
  },
);

// ---------------------------------------------------------------------------
// Tool: get_session_detail
// ---------------------------------------------------------------------------
server.tool(
  'get_session_detail',
  'Get full session detail including prep notes and Q&A.',
  { sessionId: z.string().describe('Session UUID') },
  async ({ sessionId }) => {
    const db = getDb();
    const { data, error } = await db
      .from('sessions')
      .select('*, applications(*, job_listings(*))')
      .eq('id', sessionId)
      .single();

    if (error) throw new Error(error.message);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ---------------------------------------------------------------------------
// Tool: get_analytics
// ---------------------------------------------------------------------------
server.tool(
  'get_analytics',
  'Get funnel analytics for a user — reply rate, interview rate, weekly activity.',
  { userId: z.string().describe('Supabase user UUID') },
  async ({ userId }) => {
    const apiUrl = process.env.API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/analytics/${userId}`);
    if (!res.ok) throw new Error(`Analytics fetch failed (${res.status})`);
    const data = await res.json();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ---------------------------------------------------------------------------
// Tool: get_user_billing
// ---------------------------------------------------------------------------
server.tool(
  'get_user_billing',
  'Get billing plan and application usage for a user.',
  { userId: z.string().describe('Supabase user UUID') },
  async ({ userId }) => {
    const db = getDb();
    const { data, error } = await db
      .from('users')
      .select('plan, applications_this_month, plan_period_end, stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const transport = new StdioServerTransport();
await server.connect(transport);
