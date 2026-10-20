import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  scope: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly db: SupabaseClient;

  private readonly clientId     = process.env.GOOGLE_CLIENT_ID!;
  private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  private readonly redirectUri  = process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3001/auth/google/callback';

  constructor() {
    this.db = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /** Returns the Google OAuth consent URL for a user. */
  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/calendar.events',
    ].join(' ');

    const params = new URLSearchParams({
      client_id:     this.clientId,
      redirect_uri:  this.redirectUri,
      response_type: 'code',
      scope:         scopes,
      access_type:   'offline',
      prompt:        'consent',
      state:         userId,           // passed back unchanged in callback
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  /** Exchanges the OAuth code for tokens and stores them in Supabase. */
  async handleCallback(code: string, userId: string): Promise<void> {
    const tokens = await this.exchangeCode(code);
    await this.storeTokens(userId, tokens);
    this.logger.log(`Google OAuth tokens stored for user ${userId}`);
  }

  /** Refreshes expired access token and updates Supabase. */
  async refreshAccessToken(userId: string): Promise<string> {
    const { data: row } = await this.db
      .from('user_google_tokens')
      .select('refresh_token')
      .eq('user_id', userId)
      .single();

    if (!row?.refresh_token) {
      throw new UnauthorizedException(`No refresh token for user ${userId} — re-authorize Google`);
    }

    const body = new URLSearchParams({
      client_id:     this.clientId,
      client_secret: this.clientSecret,
      grant_type:    'refresh_token',
      refresh_token: row.refresh_token,
    });

    const res  = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body });
    const data = await res.json() as { access_token: string; expires_in: number };

    if (!data.access_token) {
      throw new UnauthorizedException('Token refresh failed — re-authorize Google');
    }

    const expiry = Date.now() + data.expires_in * 1000;
    await this.db.from('user_google_tokens').upsert({
      user_id:      userId,
      access_token: data.access_token,
      expiry_date:  expiry,
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'user_id' });

    return data.access_token;
  }

  /** Returns a valid access token for the user, auto-refreshing if expired. */
  async getValidAccessToken(userId: string): Promise<string> {
    const { data: row } = await this.db
      .from('user_google_tokens')
      .select('access_token, expiry_date')
      .eq('user_id', userId)
      .single();

    if (!row?.access_token) {
      throw new UnauthorizedException(`User ${userId} has not connected Google — redirect to /auth/google?userId=${userId}`);
    }

    const expiresAt = row.expiry_date ?? 0;
    if (Date.now() > expiresAt - 60_000) {
      return this.refreshAccessToken(userId);
    }

    return row.access_token;
  }

  private async exchangeCode(code: string): Promise<GoogleTokens> {
    const body = new URLSearchParams({
      code,
      client_id:     this.clientId,
      client_secret: this.clientSecret,
      redirect_uri:  this.redirectUri,
      grant_type:    'authorization_code',
    });

    const res  = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body });
    const data = await res.json() as GoogleTokens & { error?: string; expires_in?: number };

    if (data.error || !data.access_token) {
      throw new UnauthorizedException(`Google token exchange failed: ${data.error}`);
    }

    return {
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expiry_date:   data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
      scope:         data.scope,
    };
  }

  private async storeTokens(userId: string, tokens: GoogleTokens): Promise<void> {
    await this.db.from('user_google_tokens').upsert({
      user_id:       userId,
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expiry_date:   tokens.expiry_date   ?? null,
      scope:         tokens.scope,
      updated_at:    new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }
}
