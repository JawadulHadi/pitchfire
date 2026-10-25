import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { PLAN_LIMITS } from '@pitchfire/shared';
import type { Plan } from '@pitchfire/shared';

const PLAN_PRICES: Record<'pro' | 'agency', number> = {
  pro:    1499,   // PKR per month
  agency: 4999,
};

@Injectable()
export class BillingService {
  private readonly db = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );

  private buildHash(fields: string[]): string {
    const salt = process.env.JAZZCASH_INTEGRITY_SALT ?? '';
    const message = [salt, ...fields].join('&');
    return crypto.createHmac('sha256', salt).update(message).digest('hex').toUpperCase();
  }

  async createPaymentRequest(
    userId: string,
    plan: 'pro' | 'agency',
  ): Promise<{ formUrl: string; formData: Record<string, string> }> {
    const { data: user } = await this.db
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!user) throw new BadRequestException('User not found.');

    const merchantId = process.env.JAZZCASH_MERCHANT_ID ?? '';
    const password   = process.env.JAZZCASH_PASSWORD ?? '';
    const apiUrl     = process.env.JAZZCASH_API_URL
      ?? 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform';

    const amount     = PLAN_PRICES[plan];
    const txnRefNo   = `PF-${userId.slice(0, 8)}-${Date.now()}`;
    const txnDate    = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const returnUrl  = `${process.env.API_URL}/billing/callback`;

    const hashFields = [
      merchantId,
      password,
      amount.toString(),
      txnRefNo,
      txnDate,
      'PKR',
      returnUrl,
    ];

    const formData: Record<string, string> = {
      pp_Version:        '1.1',
      pp_TxnType:        'MWALLET',
      pp_Language:       'EN',
      pp_MerchantID:     merchantId,
      pp_Password:       password,
      pp_TxnRefNo:       txnRefNo,
      pp_Amount:         (amount * 100).toString(), // JazzCash expects paisa
      pp_TxnCurrency:    'PKR',
      pp_TxnDateTime:    txnDate,
      pp_BillReference:  `plan_${plan}_user_${userId}`,
      pp_Description:    `PitchFire ${plan} plan — monthly`,
      pp_TxnExpiryDateTime: new Date(Date.now() + 30 * 60 * 1000)
        .toISOString().replace(/[-T:.Z]/g, '').slice(0, 14),
      pp_ReturnURL:      returnUrl,
      ppmpf_1:           userId,
      ppmpf_2:           plan,
      pp_SecureHash:     this.buildHash(hashFields),
    };

    return { formUrl: apiUrl, formData };
  }

  async handleCallback(params: Record<string, string>): Promise<void> {
    const responseCode = params['pp_ResponseCode'];
    if (responseCode !== '000') return; // payment failed

    const userId = params['ppmpf_1'];
    const plan   = params['ppmpf_2'] as Plan;

    if (!userId || !plan || !['pro', 'agency'].includes(plan)) return;

    const periodStart = new Date();
    const periodEnd   = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.db.from('users').update({
      plan,
      plan_period_start:       periodStart.toISOString(),
      plan_period_end:         periodEnd.toISOString(),
      applications_this_month: 0,
    }).eq('id', userId);
  }

  async getUserBilling(userId: string) {
    const { data: user } = await this.db
      .from('users')
      .select('plan, applications_this_month, plan_period_end')
      .eq('id', userId)
      .single();

    if (!user) return null;

    const plan  = user.plan as Plan;
    const limit = PLAN_LIMITS[plan].applications_per_month;

    return {
      plan,
      applications_used:  user.applications_this_month,
      applications_limit: limit === 9999 ? null : limit,
      period_end:         user.plan_period_end,
      prices:             PLAN_PRICES,
    };
  }

  async enforceLimit(userId: string): Promise<void> {
    const { data: user } = await this.db
      .from('users')
      .select('plan, applications_this_month')
      .eq('id', userId)
      .single();

    if (!user) return;
    const limit = PLAN_LIMITS[user.plan as Plan].applications_per_month;
    if (user.applications_this_month >= limit) {
      throw new ForbiddenException(
        `Monthly limit reached (${limit}). Upgrade to Pro for unlimited applications.`,
      );
    }
  }

  async incrementUsage(userId: string): Promise<void> {
    await this.db.rpc('increment_applications_count', { uid: userId });
  }
}
