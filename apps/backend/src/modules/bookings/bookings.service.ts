import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { SupabaseService } from "../../common/database/supabase.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { Booking } from "./entities/booking.entity";

@Injectable()
export class BookingsService {
  private static readonly LOCK_DURATION_MINUTES = 15;

  constructor(private readonly supabaseService: SupabaseService) {}

  private generateBookingReference(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK${timestamp}${random}`;
  }

  /**
   * Expire les verrous (pending_payment) dont le délai est dépassé.
   * Appelé avant chaque vérification de disponibilité et périodiquement.
   */
  async expireLocks(): Promise<number> {
    const supabase = this.supabaseService.getClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("bookings")
      .update({
        status: "expired",
        cancellation_reason: "Délai de paiement expiré (15 minutes)",
        cancelled_at: now,
      })
      .eq("status", "pending_payment")
      .lt("locked_until", now)
      .select("id");

    if (error) {
      console.error("Error expiring locks:", error);
      return 0;
    }

    if (data && data.length > 0) {
      console.log(`Expired ${data.length} pending booking(s)`);
    }
    return data?.length || 0;
  }

  async create(
    userId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    const supabase = this.supabaseService.getClient();

    // Validation des dates
    const checkIn = new Date(createBookingDto.check_in);
    const checkOut = new Date(createBookingDto.check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw new BadRequestException(
        "La date d'arrivée ne peut pas être dans le passé",
      );
    }

    if (checkOut <= checkIn) {
      throw new BadRequestException(
        "La date de départ doit être après la date d'arrivée",
      );
    }

    // Calcul du nombre de nuits
    const numberOfNights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (numberOfNights > 90) {
      throw new BadRequestException(
        "La durée maximale de réservation est de 90 nuits",
      );
    }

    // Vérifier que la chambre existe et récupérer son prix
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, base_price, capacity_adults, capacity_children, is_active")
      .eq("id", createBookingDto.room_id)
      .single();

    if (roomError || !room) {
      throw new NotFoundException("Chambre non trouvée");
    }

    if (!room.is_active) {
      throw new BadRequestException("Cette chambre n'est pas disponible");
    }

    // Calculer le nombre total de personnes
    const totalGuests =
      createBookingDto.adults +
      (createBookingDto.children || 0) +
      (createBookingDto.infants || 0);

    // Vérifier la capacité
    const totalCapacity = room.capacity_adults + (room.capacity_children || 0);
    if (totalGuests > totalCapacity) {
      throw new BadRequestException(
        `Cette chambre ne peut accueillir que ${totalCapacity} personne(s)`,
      );
    }

    // Expirer les verrous périmés avant de vérifier les conflits
    await this.expireLocks();

    // Calculer les prix
    const roomPricePerNight = room.base_price;
    const subtotal = roomPricePerNight * numberOfNights;
    const taxesTotal = subtotal * 0.1; // 10% de taxes
    const totalPrice = subtotal + taxesTotal;

    // Générer une référence de réservation unique
    const bookingReference = this.generateBookingReference();

    // Calculer la date d'expiration du verrou (15 minutes)
    const lockedUntil = new Date(
      Date.now() + BookingsService.LOCK_DURATION_MINUTES * 60 * 1000,
    ).toISOString();

    // Création atomique via RPC (SELECT FOR UPDATE + INSERT transactionnel)
    // Élimine la race condition entre vérification et insertion
    const { data: booking, error: createError } = await supabase.rpc(
      "create_booking_atomic",
      {
        p_user_id: userId,
        p_room_id: createBookingDto.room_id,
        p_hotel_id: createBookingDto.hotel_id,
        p_check_in: createBookingDto.check_in,
        p_check_out: createBookingDto.check_out,
        p_adults: createBookingDto.adults,
        p_children: createBookingDto.children || 0,
        p_infants: createBookingDto.infants || 0,
        p_guests: totalGuests,
        p_total_nights: numberOfNights,
        p_room_price_per_night: roomPricePerNight,
        p_taxes_total: taxesTotal,
        p_extras_total: 0,
        p_discount_amount: 0,
        p_commission_amount: 0,
        p_total_price: totalPrice,
        p_booking_reference: bookingReference,
        p_channel: "direct_website",
        p_special_requests: createBookingDto.special_requests || null,
        p_arrival_time: createBookingDto.arrival_time || null,
        p_early_checkin: createBookingDto.early_checkin || false,
        p_late_checkout: createBookingDto.late_checkout || false,
        p_locked_until: lockedUntil,
      },
    );

    if (createError) {
      console.error("Booking creation error:", createError);

      // Détecter les erreurs de conflit (exclusion_violation du RPC ou contrainte EXCLUDE)
      const errorMessage = createError.message || "";
      if (
        errorMessage.includes("BOOKING_CONFLICT") ||
        errorMessage.includes("exclusion_violation") ||
        errorMessage.includes("conflicting key value") ||
        errorMessage.includes("bookings_no_overlap") ||
        createError.code === "23P01"
      ) {
        throw new ConflictException(
          "Cette chambre n'est pas disponible pour ces dates. Un autre utilisateur a réservé entre-temps.",
        );
      }

      throw new BadRequestException(
        "Erreur lors de la création de la réservation",
      );
    }

    if (!booking) {
      throw new BadRequestException(
        "Erreur lors de la création de la réservation",
      );
    }

    return booking;
  }

  async findAllByUser(userId: string): Promise<Booking[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        room:rooms(room_number, room_type, base_price, view_type),
        hotel:hotels(name, city, address, phone, stars)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      throw new BadRequestException(
        "Erreur lors de la récupération des réservations",
      );
    }

    return data || [];
  }

  async findOne(id: string, userId: string): Promise<Booking> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        room:rooms(room_number, room_type, base_price, amenities, view_type),
        hotel:hotels(name, city, address, phone, email, stars)
      `,
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundException("Réservation non trouvée");
    }

    // Vérifier que la réservation appartient à l'utilisateur
    if (data.user_id !== userId) {
      throw new ForbiddenException("Accès non autorisé");
    }

    return data;
  }

  async cancel(id: string, userId: string, reason?: string): Promise<Booking> {
    const supabase = this.supabaseService.getClient();

    // Récupérer la réservation
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      throw new NotFoundException("Réservation non trouvée");
    }

    // Vérifier que la réservation appartient à l'utilisateur
    if (booking.user_id !== userId) {
      throw new ForbiddenException("Accès non autorisé");
    }

    // Vérifier que la réservation peut être annulée
    if (booking.status === "cancelled") {
      throw new BadRequestException("Cette réservation est déjà annulée");
    }

    if (booking.status === "completed" || booking.status === "checked_out") {
      throw new BadRequestException(
        "Impossible d'annuler une réservation terminée",
      );
    }

    // Vérifier que l'annulation se fait au moins 24h avant le check-in
    const checkInDate = new Date(booking.check_in);
    const now = new Date();
    const hoursUntilCheckIn =
      (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      throw new BadRequestException(
        "Les annulations doivent être effectuées au moins 24h avant l'arrivée",
      );
    }

    // Annuler la réservation
    const { data: cancelledBooking, error: cancelError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || "Annulation par le client",
      })
      .eq("id", id)
      .select()
      .single();

    if (cancelError || !cancelledBooking) {
      console.error("Cancel error:", cancelError);
      throw new BadRequestException(
        "Erreur lors de l'annulation de la réservation",
      );
    }

    return cancelledBooking;
  }

  /**
   * Modifier une réservation existante (dates, voyageurs, options).
   * Seules les réservations en statut pending_payment ou confirmed peuvent être modifiées.
   * Si les dates changent, on recalcule le prix et on vérifie la disponibilité.
   */
  async update(
    id: string,
    userId: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const supabase = this.supabaseService.getClient();

    // Récupérer la réservation existante
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*, room:rooms(base_price, capacity_adults, capacity_children)")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      throw new NotFoundException("Réservation non trouvée");
    }

    if (booking.user_id !== userId) {
      throw new ForbiddenException("Accès non autorisé");
    }

    // Seules les réservations pending_payment ou confirmed sont modifiables
    if (!["pending_payment", "confirmed"].includes(booking.status)) {
      throw new BadRequestException(
        "Seules les réservations en attente ou confirmées peuvent être modifiées",
      );
    }

    // Vérifier que la modification se fait au moins 24h avant le check-in actuel
    const currentCheckIn = new Date(booking.check_in);
    const now = new Date();
    const hoursUntilCheckIn =
      (currentCheckIn.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      throw new BadRequestException(
        "Les modifications doivent être effectuées au moins 24h avant l'arrivée",
      );
    }

    const updateData: Record<string, any> = {};

    // Mise à jour des dates si fournies
    const newCheckIn = updateBookingDto.check_in
      ? new Date(updateBookingDto.check_in)
      : new Date(booking.check_in);
    const newCheckOut = updateBookingDto.check_out
      ? new Date(updateBookingDto.check_out)
      : new Date(booking.check_out);

    const datesChanged =
      updateBookingDto.check_in !== undefined ||
      updateBookingDto.check_out !== undefined;

    if (datesChanged) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newCheckIn < today) {
        throw new BadRequestException(
          "La date d'arrivée ne peut pas être dans le passé",
        );
      }

      if (newCheckOut <= newCheckIn) {
        throw new BadRequestException(
          "La date de départ doit être après la date d'arrivée",
        );
      }

      const numberOfNights = Math.ceil(
        (newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (numberOfNights > 90) {
        throw new BadRequestException(
          "La durée maximale de réservation est de 90 nuits",
        );
      }

      // Vérifier la disponibilité pour les nouvelles dates (exclure la réservation actuelle)
      await this.expireLocks();

      const { data: conflicts, error: conflictError } = await supabase
        .from("bookings")
        .select("id")
        .eq("room_id", booking.room_id)
        .neq("id", id)
        .in("status", ["pending_payment", "confirmed", "checked_in"])
        .lt("check_in", updateBookingDto.check_out || booking.check_out)
        .gt("check_out", updateBookingDto.check_in || booking.check_in);

      if (conflictError) {
        throw new BadRequestException(
          "Erreur lors de la vérification de disponibilité",
        );
      }

      if (conflicts && conflicts.length > 0) {
        throw new ConflictException(
          "Cette chambre n'est pas disponible pour les nouvelles dates",
        );
      }

      // Recalculer le prix
      const roomPricePerNight = booking.room.base_price;
      const subtotal = roomPricePerNight * numberOfNights;
      const taxesTotal = subtotal * 0.1;
      const totalPrice = subtotal + taxesTotal;

      updateData.check_in = updateBookingDto.check_in || booking.check_in;
      updateData.check_out = updateBookingDto.check_out || booking.check_out;
      updateData.total_nights = numberOfNights;
      updateData.room_price_per_night = roomPricePerNight;
      updateData.taxes_total = taxesTotal;
      updateData.total_price = totalPrice;
    }

    // Mise à jour des voyageurs si fournis
    const newAdults = updateBookingDto.adults ?? booking.adults;
    const newChildren = updateBookingDto.children ?? booking.children;
    const newInfants = updateBookingDto.infants ?? booking.infants;
    const totalGuests = newAdults + newChildren + newInfants;

    if (
      updateBookingDto.adults !== undefined ||
      updateBookingDto.children !== undefined ||
      updateBookingDto.infants !== undefined
    ) {
      const totalCapacity =
        booking.room.capacity_adults + (booking.room.capacity_children || 0);
      if (totalGuests > totalCapacity) {
        throw new BadRequestException(
          `Cette chambre ne peut accueillir que ${totalCapacity} personne(s)`,
        );
      }

      updateData.adults = newAdults;
      updateData.children = newChildren;
      updateData.infants = newInfants;
      updateData.guests = totalGuests;
    }

    // Mise à jour des options
    if (updateBookingDto.special_requests !== undefined) {
      updateData.special_requests = updateBookingDto.special_requests;
    }
    if (updateBookingDto.arrival_time !== undefined) {
      updateData.arrival_time = updateBookingDto.arrival_time;
    }
    if (updateBookingDto.early_checkin !== undefined) {
      updateData.early_checkin = updateBookingDto.early_checkin;
    }
    if (updateBookingDto.late_checkout !== undefined) {
      updateData.late_checkout = updateBookingDto.late_checkout;
    }

    // Vérifier qu'il y a bien des modifications
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException("Aucune modification à appliquer");
    }

    updateData.updated_at = new Date().toISOString();

    // Appliquer la modification
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedBooking) {
      console.error("Update booking error:", updateError);
      throw new BadRequestException(
        "Erreur lors de la modification de la réservation",
      );
    }

    return updatedBooking;
  }

  /**
   * Confirmer une réservation en attente de paiement.
   * Vérifie que le verrou n'a pas expiré.
   */
  async confirm(id: string, userId: string): Promise<Booking> {
    const supabase = this.supabaseService.getClient();

    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      throw new NotFoundException("Réservation non trouvée");
    }

    if (booking.user_id !== userId) {
      throw new ForbiddenException("Accès non autorisé");
    }

    if (booking.status !== "pending_payment") {
      throw new BadRequestException(
        booking.status === "confirmed"
          ? "Cette réservation est déjà confirmée"
          : "Cette réservation ne peut pas être confirmée",
      );
    }

    // Vérifier que le verrou n'a pas expiré
    if (booking.locked_until && new Date(booking.locked_until) < new Date()) {
      // Expirer la réservation
      await supabase
        .from("bookings")
        .update({
          status: "expired",
          cancellation_reason: "Délai de paiement expiré (15 minutes)",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", id);

      throw new BadRequestException(
        "Le délai de confirmation a expiré. Veuillez refaire une réservation.",
      );
    }

    // Confirmer la réservation
    const { data: confirmedBooking, error: confirmError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        locked_until: null,
      })
      .eq("id", id)
      .select()
      .single();

    if (confirmError || !confirmedBooking) {
      console.error("Confirm error:", confirmError);
      throw new BadRequestException(
        "Erreur lors de la confirmation de la réservation",
      );
    }

    return confirmedBooking;
  }

  async findAll(): Promise<Booking[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        room:rooms(room_number, room_type),
        hotel:hotels(name, city),
        user:users(email, first_name, last_name)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new BadRequestException(
        "Erreur lors de la récupération des réservations",
      );
    }

    return data || [];
  }

  /**
   * Récupérer toutes les réservations d'un hôtel (pour le hotel owner).
   * Vérifie que l'utilisateur est bien le propriétaire de l'hôtel.
   */
  async findAllByHotel(
    hotelId: string,
    userId: string,
    userRole: string,
  ): Promise<Booking[]> {
    const supabase = this.supabaseService.getClient();

    // Vérifier que l'hôtel existe et appartient à l'utilisateur (sauf admin)
    if (userRole !== "admin") {
      const { data: hotel, error: hotelError } = await supabase
        .from("hotels")
        .select("id, owner_id")
        .eq("id", hotelId)
        .single();

      if (hotelError || !hotel) {
        throw new NotFoundException("Hôtel non trouvé");
      }

      if (hotel.owner_id !== userId) {
        throw new ForbiddenException(
          "Vous n'êtes pas le propriétaire de cet hôtel",
        );
      }
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        room:rooms(room_number, room_type, base_price, view_type),
        user:users(email, first_name, last_name, phone)
      `,
      )
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching hotel bookings:", error);
      throw new BadRequestException(
        "Erreur lors de la récupération des réservations",
      );
    }

    return data || [];
  }

  async checkAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    // Expirer les verrous périmés
    await this.expireLocks();

    // Vérifier si la chambre existe
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, room_number")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      return false;
    }

    // Statuts bloquants : pending_payment (lock actif), confirmed, checked_in
    const { data, error } = await supabase
      .from("bookings")
      .select("id, check_in, check_out, status")
      .eq("room_id", roomId)
      .in("status", ["pending_payment", "confirmed", "checked_in"])
      .lte("check_in", checkOut)
      .gte("check_out", checkIn);

    if (error) {
      console.error("Availability check error:", error);
      return false;
    }

    return !data || data.length === 0;
  }

  // Récupérer les dates où toutes les chambres sont réservées (pour le calendrier de disponibilité)
  async getHotelBookedPeriods(
    hotelId: string,
  ): Promise<{ check_in: string; check_out: string }[]> {
    const supabase = this.supabaseService.getClient();

    // 1. Récupérer le nombre total de chambres actives pour cet hôtel
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("id")
      .eq("hotel_id", hotelId)
      .eq("is_active", true);

    if (roomsError || !rooms || rooms.length === 0) {
      console.error("Error fetching rooms:", roomsError);
      return [];
    }

    const totalRooms = rooms.length;
    const roomIds = rooms.map((r) => r.id);

    // 2. Récupérer les réservations bloquantes pour ces chambres
    const today = new Date().toISOString().split("T")[0];
    await this.expireLocks();
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("room_id, check_in, check_out")
      .in("room_id", roomIds)
      .in("status", ["pending_payment", "confirmed", "checked_in"])
      .gte("check_out", today);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return [];
    }

    if (!bookings || bookings.length === 0) {
      return []; // Aucune réservation = toutes les dates sont disponibles
    }

    // 3. Calculer les dates où TOUTES les chambres sont réservées
    // Créer un dictionnaire: date -> ensemble de chambres réservées
    const dateRoomMap: Map<string, Set<string>> = new Map();

    for (const booking of bookings) {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);

      // Pour chaque nuit de la réservation (check_in inclus, check_out exclus)
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        const dateStr = currentDate.toISOString().split("T")[0];

        if (!dateRoomMap.has(dateStr)) {
          dateRoomMap.set(dateStr, new Set());
        }
        dateRoomMap.get(dateStr)!.add(booking.room_id);

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // 4. Trouver les dates où toutes les chambres sont réservées
    const fullyBookedDates: string[] = [];
    for (const [date, bookedRooms] of dateRoomMap.entries()) {
      if (bookedRooms.size >= totalRooms) {
        fullyBookedDates.push(date);
      }
    }

    // 5. Regrouper les dates consécutives en périodes
    if (fullyBookedDates.length === 0) {
      return [];
    }

    fullyBookedDates.sort();
    const periods: { check_in: string; check_out: string }[] = [];
    let periodStart = fullyBookedDates[0];
    let periodEnd = fullyBookedDates[0];

    for (let i = 1; i < fullyBookedDates.length; i++) {
      const currentDate = new Date(fullyBookedDates[i]);
      const prevDate = new Date(periodEnd);
      prevDate.setDate(prevDate.getDate() + 1);

      if (
        currentDate.toISOString().split("T")[0] ===
        prevDate.toISOString().split("T")[0]
      ) {
        // Dates consécutives, étendre la période
        periodEnd = fullyBookedDates[i];
      } else {
        // Nouvelle période
        const endDate = new Date(periodEnd);
        endDate.setDate(endDate.getDate() + 1);
        periods.push({
          check_in: periodStart,
          check_out: endDate.toISOString().split("T")[0],
        });
        periodStart = fullyBookedDates[i];
        periodEnd = fullyBookedDates[i];
      }
    }

    // Ajouter la dernière période
    const endDate = new Date(periodEnd);
    endDate.setDate(endDate.getDate() + 1);
    periods.push({
      check_in: periodStart,
      check_out: endDate.toISOString().split("T")[0],
    });

    console.log("=== CALENDAR AVAILABILITY ===");
    console.log("Hotel:", hotelId);
    console.log("Total rooms:", totalRooms);
    console.log("Fully booked dates:", fullyBookedDates.length);
    console.log("Periods:", periods);
    console.log("============================");

    return periods;
  }

  /**
   * Récupérer les périodes réservées pour une chambre spécifique
   * Permet d'afficher le calendrier de disponibilité par chambre
   */
  async getRoomBookedPeriods(
    roomId: string,
  ): Promise<{ check_in: string; check_out: string; status: string }[]> {
    const supabase = this.supabaseService.getClient();

    // Vérifier que la chambre existe
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, room_number, hotel_id")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      console.error("Room not found:", roomId);
      return [];
    }

    // Récupérer toutes les réservations actives pour cette chambre
    const today = new Date().toISOString().split("T")[0];
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("check_in, check_out, status")
      .eq("room_id", roomId)
      .neq("status", "cancelled")
      .gte("check_out", today)
      .order("check_in", { ascending: true });

    if (bookingsError) {
      console.error("Error fetching room bookings:", bookingsError);
      return [];
    }

    console.log("=== ROOM CALENDAR ===");
    console.log("Room:", roomId, "- Number:", room.room_number);
    console.log("Bookings found:", bookings?.length || 0);
    console.log("=====================");

    return bookings || [];
  }

  /**
   * Récupérer toutes les réservations de toutes les chambres d'un hôtel
   * avec le détail par chambre (pour un calendrier complet)
   */
  async getHotelRoomsAvailability(hotelId: string): Promise<{
    rooms: { id: string; room_number: string; room_type: string }[];
    bookings: {
      room_id: string;
      check_in: string;
      check_out: string;
      status: string;
    }[];
  }> {
    const supabase = this.supabaseService.getClient();

    // 1. Récupérer toutes les chambres actives de l'hôtel
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("id, room_number, room_type")
      .eq("hotel_id", hotelId)
      .eq("is_active", true)
      .order("room_number", { ascending: true });

    if (roomsError || !rooms) {
      console.error("Error fetching rooms:", roomsError);
      return { rooms: [], bookings: [] };
    }

    if (rooms.length === 0) {
      return { rooms: [], bookings: [] };
    }

    const roomIds = rooms.map((r) => r.id);

    // 2. Récupérer les réservations bloquantes pour ces chambres
    const today = new Date().toISOString().split("T")[0];
    await this.expireLocks();
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("room_id, check_in, check_out, status")
      .in("room_id", roomIds)
      .in("status", ["pending_payment", "confirmed", "checked_in"])
      .gte("check_out", today)
      .order("check_in", { ascending: true });

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return { rooms, bookings: [] };
    }

    console.log("=== HOTEL ROOMS AVAILABILITY ===");
    console.log("Hotel:", hotelId);
    console.log("Total rooms:", rooms.length);
    console.log("Total bookings:", bookings?.length || 0);
    console.log("================================");

    return {
      rooms,
      bookings: bookings || [],
    };
  }
}
