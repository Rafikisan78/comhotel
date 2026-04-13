import { Injectable, OnModuleInit } from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class StripeService implements OnModuleInit {
  private stripe: Stripe;

  onModuleInit() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.warn(
        "⚠️ STRIPE_SECRET_KEY non configurée — paiements désactivés",
      );
      return;
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });
    console.log("✅ Stripe initialisé");
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string> = {},
  ): Promise<{ clientSecret: string; id: string }> {
    if (!this.stripe) {
      throw new Error("Stripe non configuré");
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      id: paymentIntent.id,
    };
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new Error("Stripe non configuré");
    }
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
}
