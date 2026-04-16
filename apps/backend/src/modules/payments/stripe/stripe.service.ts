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

  private ensureStripe() {
    if (!this.stripe) throw new Error("Stripe non configuré");
  }

  // ─── PaymentIntents ────────────────────────────────────────────────────────

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string> = {},
  ): Promise<{ clientSecret: string; id: string }> {
    this.ensureStripe();
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
      capture_method: "manual",
    });
    return { clientSecret: paymentIntent.client_secret!, id: paymentIntent.id };
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    this.ensureStripe();
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async capturePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    this.ensureStripe();
    return this.stripe.paymentIntents.capture(paymentIntentId);
  }

  async cancelPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    this.ensureStripe();
    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  // ─── Customers ─────────────────────────────────────────────────────────────

  /**
   * Crée ou récupère le Customer Stripe associé à un utilisateur.
   * La recherche se fait via les métadonnées `user_id`.
   */
  async createOrGetCustomer(userId: string, email: string): Promise<string> {
    this.ensureStripe();
    const existing = await this.stripe.customers.search({
      query: `metadata['user_id']:'${userId}'`,
    });
    if (existing.data.length > 0) return existing.data[0].id;

    const customer = await this.stripe.customers.create({
      email,
      metadata: { user_id: userId },
    });
    return customer.id;
  }

  // ─── PaymentMethods ────────────────────────────────────────────────────────

  /**
   * Attache une PaymentMethod à un Customer Stripe.
   */
  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    this.ensureStripe();
    return this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  /**
   * Liste toutes les cartes (type=card) attachées à un Customer.
   */
  async listPaymentMethods(
    customerId: string,
  ): Promise<Stripe.PaymentMethod[]> {
    this.ensureStripe();
    const result = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });
    return result.data;
  }

  /**
   * Détache une PaymentMethod d'un Customer (suppression côté Stripe).
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    this.ensureStripe();
    await this.stripe.paymentMethods.detach(paymentMethodId);
  }

  /**
   * Récupère une PaymentMethod par son ID.
   */
  async retrievePaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    this.ensureStripe();
    return this.stripe.paymentMethods.retrieve(paymentMethodId);
  }
}
