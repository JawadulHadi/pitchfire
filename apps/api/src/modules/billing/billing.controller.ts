import {
  Controller, Get, Post, Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BillingService } from './billing.service.js';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get current plan + usage for user' })
  getUserBilling(@Param('userId') userId: string) {
    return this.billing.getUserBilling(userId);
  }

  @Post(':userId/pay/:plan')
  @ApiOperation({ summary: 'Initiate JazzCash payment for plan upgrade' })
  pay(
    @Param('userId') userId: string,
    @Param('plan') plan: 'pro' | 'agency',
  ) {
    return this.billing.createPaymentRequest(userId, plan);
  }

  @Post('callback')
  @ApiOperation({ summary: 'JazzCash payment callback' })
  callback(@Body() params: Record<string, string>) {
    return this.billing.handleCallback(params);
  }
}
