import { createClient, SupabaseClient } from '@supabase/supabase-js';

type GoogleTokenRow = {
  user_id: string;
  access_token: string | null;
  refresh_token: string | null;
  expiry_date: number | null;
  scope: string | null;
  updated_at: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

function db(): AnyClient {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Returns a valid Google access token for the user, auto-refreshing if expired.
 * Replicates NestJS AuthService.getValidAccessToken() for use inside the BullMQ worker.
 */
export async function getValidGoogleToken(userId: string): Promise<string | null> {
  const supabase = db();
  const { data: row } = await supabase
    .from('user_google_tokens')
    .select('access_token, refresh_token, expiry_date')
    .eq('user_id', userId)
    .single() as { data: Pick<GoogleTokenRow, 'access_token' | 'refresh_token' | 'expiry_date'> | null; error: unknown };

  if (!row?.access_token) return null;

  const expiresAt = row.expiry_date ?? 0;
  if (Date.now() > expiresAt - 60_000) {
    return refreshToken(supabase, userId, row.refresh_token ?? '');
  }

  return row.access_token;
}

async function refreshToken(
  supabase: AnyClient,
  userId: string,
  refreshToken: string,
): Promise<string | null> {
  if (!refreshToken) return null;

  const body = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
  });

  try {
    const res  = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body });
    const data = await res.json() as { access_token?: string; expires_in?: number; error?: string };

    if (!data.access_token) return null;

    const expiry = Date.now() + (data.expires_in ?? 3600) * 1000;
    await supabase.from('user_google_tokens').upsert({
      user_id:      userId,
      access_token: data.access_token,
      expiry_date:  expiry,
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'user_id' });

    return data.access_token;
  } catch {
    return null;
  }
}
