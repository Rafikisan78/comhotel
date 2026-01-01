import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeService {
  // Mock Stripe service - will implement real Stripe integration later
  async createPaymentIntent(amount: number, currency: string) {
    return {
      clientSecret: 'mock_client_secret',
      id: 'mock_payment_intent_id',
    };
  }
}
