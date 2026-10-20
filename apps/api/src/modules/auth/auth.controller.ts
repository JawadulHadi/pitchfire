import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Step 1 — redirect user to Google consent screen. */
  @Get('google')
  @ApiOperation({ summary: 'Start Google OAuth flow for Gmail + Calendar access' })
  @ApiQuery({ name: 'userId', description: 'Supabase user UUID' })
  initiateGoogleOAuth(
    @Query('userId') userId: string,
    @Res() res: Response,
  ) {
    if (!userId) throw new BadRequestException('userId is required');
    const url = this.auth.getAuthUrl(userId);
    return res.redirect(url);
  }

  /** Step 2 — Google redirects here with ?code=...&state=<userId> */
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback — exchanges code for tokens and stores them' })
  @ApiQuery({ name: 'code',  description: 'Authorization code from Google' })
  @ApiQuery({ name: 'state', description: 'userId passed through from /auth/google' })
  async googleCallback(
    @Query('code')  code:  string,
    @Query('state') state: string,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';

    if (error) {
      return res.redirect(`${webUrl}/settings?google_auth=error&reason=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      throw new BadRequestException('Missing code or state param');
    }

    try {
      await this.auth.handleCallback(code, state);
      return res.redirect(`${webUrl}/settings?google_auth=success`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      return res.redirect(`${webUrl}/settings?google_auth=error&reason=${encodeURIComponent(msg)}`);
    }
  }

  /** Check if a user has Google connected. */
  @Get('google/status')
  @ApiOperation({ summary: 'Check whether a user has connected Google' })
  @ApiQuery({ name: 'userId' })
  async googleStatus(@Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    try {
      await this.auth.getValidAccessToken(userId);
      return { connected: true };
    } catch {
      return { connected: false };
    }
  }
}
