export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDto {
  bookingId: string;
  amount: number;
  currency?: string;
}

export interface StripePaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}
