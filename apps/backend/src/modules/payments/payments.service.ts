import { Injectable, BadRequestException } from "@nestjs/common";
import { StripeService } from "./stripe/stripe.service";
import { SupabaseService } from "../../common/database/supabase.service";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async createPaymentIntent(bookingId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, total_price, status, user_id, booking_reference, hotel_id")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      throw new BadRequestException("Réservation non trouvée");
    }

    if (booking.user_id !== userId) {
      throw new BadRequestException("Accès non autorisé");
    }

    if (booking.status !== "pending_payment") {
      throw new BadRequestException(
        "Cette réservation ne peut pas être payée (statut: " +
          booking.status +
          ")",
      );
    }

    // Stripe exige un montant minimum de 0.50€
    const amount = Number(booking.total_price);
    if (amount < 0.5) {
      throw new BadRequestException(
        "Le montant minimum pour un paiement en ligne est de 0,50€. Veuillez choisir le paiement sur place.",
      );
    }

    // Créer le Payment Intent Stripe
    const paymentIntent = await this.stripeService.createPaymentIntent(
      amount,
      "eur",
      {
        booking_id: booking.id,
        booking_reference: booking.booking_reference,
        user_id: userId,
      },
    );

    // Sauvegarder le payment_intent_id sur la réservation
    await supabase
      .from("bookings")
      .update({ payment_id: paymentIntent.id })
      .eq("id", bookingId);

    return {
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
      amount: Number(booking.total_price),
      bookingReference: booking.booking_reference,
    };
  }

  async confirmPayment(bookingId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "id, status, payment_id, user_id, total_price, booking_reference, hotel_id, room_id, check_in, check_out",
      )
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      throw new BadRequestException("Réservation non trouvée");
    }

    if (booking.user_id !== userId) {
      throw new BadRequestException("Accès non autorisé");
    }

    if (booking.status !== "pending_payment") {
      throw new BadRequestException("Cette réservation a déjà été traitée");
    }

    // Vérifier le paiement Stripe si un payment_id existe
    if (booking.payment_id) {
      try {
        const paymentIntent = await this.stripeService.retrievePaymentIntent(
          booking.payment_id,
        );
        if (paymentIntent.status !== "succeeded") {
          throw new BadRequestException(
            "Le paiement n'a pas été confirmé par Stripe",
          );
        }
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        console.error("Stripe verification error:", err);
        throw new BadRequestException(
          "Erreur lors de la vérification du paiement",
        );
      }
    }

    // Confirmer la réservation avec payment_method = stripe
    const { data: confirmed, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        payment_method: "stripe",
        locked_until: null,
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException("Erreur lors de la confirmation");
    }

    return confirmed;
  }

  /**
   * Confirmer une réservation avec paiement sur place.
   * Pas de vérification Stripe — le client paiera à l'hôtel.
   */
  async confirmOnsitePayment(bookingId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, status, user_id, booking_reference")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      throw new BadRequestException("Réservation non trouvée");
    }

    if (booking.user_id !== userId) {
      throw new BadRequestException("Accès non autorisé");
    }

    if (booking.status !== "pending_payment") {
      throw new BadRequestException("Cette réservation a déjà été traitée");
    }

    // Confirmer directement sans paiement Stripe
    const { data: confirmed, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        payment_method: "on_site",
        locked_until: null,
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException("Erreur lors de la confirmation");
    }

    return confirmed;
  }
}
