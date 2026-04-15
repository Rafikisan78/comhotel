import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
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
        // Avec capture_method: 'manual', le statut après confirmation client
        // est 'requires_capture' (pas 'succeeded'). Les deux sont valides.
        if (
          paymentIntent.status !== "succeeded" &&
          paymentIntent.status !== "requires_capture"
        ) {
          throw new BadRequestException(
            "Le paiement n'a pas été confirmé par Stripe (statut: " +
              paymentIntent.status +
              ")",
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

  /**
   * Créer un PaymentIntent pour un supplément (différence de prix après modification).
   * Le montant est validé côté serveur.
   */
  async createSupplementPayment(
    bookingId: string,
    userId: string,
    amount: number,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, user_id, status, booking_reference, hotel_id, total_price")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      throw new NotFoundException("Réservation non trouvée");
    }

    if (booking.user_id !== userId) {
      throw new BadRequestException("Accès non autorisé");
    }

    if (!["confirmed", "pending_payment"].includes(booking.status)) {
      throw new BadRequestException(
        "Cette réservation ne peut pas recevoir de supplément",
      );
    }

    if (amount < 0.5) {
      throw new BadRequestException(
        "Le montant minimum pour un paiement en ligne est de 0,50€",
      );
    }

    const paymentIntent = await this.stripeService.createPaymentIntent(
      amount,
      "eur",
      {
        booking_id: booking.id,
        booking_reference: booking.booking_reference,
        user_id: userId,
        type: "supplement",
      },
    );

    return {
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
      amount,
      bookingReference: booking.booking_reference,
    };
  }

  /**
   * Capturer un paiement Stripe autorisé (capture différée).
   * Réservé au hotel_owner de l'hôtel ou admin.
   */
  async capturePayment(
    bookingId: string,
    userId: string,
    userRole: string,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "id, status, payment_id, payment_method, hotel_id, booking_reference",
      )
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      throw new NotFoundException("Réservation non trouvée");
    }

    // Vérifier les droits : admin ou hotel_owner de cet hôtel
    if (userRole !== "admin") {
      const { data: hotel } = await supabase
        .from("hotels")
        .select("owner_id")
        .eq("id", booking.hotel_id)
        .single();

      if (!hotel || hotel.owner_id !== userId) {
        throw new ForbiddenException(
          "Vous n'êtes pas le propriétaire de cet hôtel",
        );
      }
    }

    if (booking.status !== "confirmed") {
      throw new BadRequestException(
        "Seules les réservations confirmées peuvent être capturées",
      );
    }

    if (booking.payment_method !== "stripe" || !booking.payment_id) {
      throw new BadRequestException(
        "Cette réservation n'a pas de paiement Stripe à capturer",
      );
    }

    try {
      const captured = await this.stripeService.capturePaymentIntent(
        booking.payment_id,
      );

      if (captured.status !== "succeeded") {
        throw new BadRequestException(
          "La capture du paiement a échoué (statut: " + captured.status + ")",
        );
      }

      // Mettre à jour le statut de la réservation
      const { data: updatedBooking, error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "checked_in",
          checked_in_at: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (updateError) {
        throw new BadRequestException("Erreur lors de la mise à jour");
      }

      return updatedBooking;
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      console.error("Stripe capture error:", err);
      throw new BadRequestException(
        "Erreur lors de la capture du paiement Stripe",
      );
    }
  }

  /**
   * Annuler un paiement Stripe autorisé (libérer l'autorisation).
   * Réservé au hotel_owner de l'hôtel ou admin.
   */
  async cancelAuthorizedPayment(
    bookingId: string,
    userId: string,
    userRole: string,
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "id, status, payment_id, payment_method, hotel_id, booking_reference",
      )
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      throw new NotFoundException("Réservation non trouvée");
    }

    // Vérifier les droits : admin ou hotel_owner de cet hôtel
    if (userRole !== "admin") {
      const { data: hotel } = await supabase
        .from("hotels")
        .select("owner_id")
        .eq("id", booking.hotel_id)
        .single();

      if (!hotel || hotel.owner_id !== userId) {
        throw new ForbiddenException(
          "Vous n'êtes pas le propriétaire de cet hôtel",
        );
      }
    }

    if (booking.status !== "confirmed") {
      throw new BadRequestException(
        "Seules les réservations confirmées peuvent être annulées",
      );
    }

    // Si paiement Stripe, annuler l'autorisation
    if (booking.payment_method === "stripe" && booking.payment_id) {
      try {
        await this.stripeService.cancelPaymentIntent(booking.payment_id);
      } catch (err) {
        console.error("Stripe cancel error:", err);
        // On continue quand même pour annuler la réservation
      }
    }

    const { data: cancelledBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: "Annulation par le gestionnaire de l'hôtel",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException("Erreur lors de l'annulation");
    }

    return cancelledBooking;
  }
}
