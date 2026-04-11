import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../../common/database/supabase.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
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

    // Vérifier les conflits de réservation
    // Une réservation est en conflit si elle chevauche les dates demandées
    // Statuts bloquants : pending_payment (lock actif), confirmed, checked_in
    const { data: conflictingBookings, error: conflictError } = await supabase
      .from("bookings")
      .select("id, status, check_in, check_out")
      .eq("room_id", createBookingDto.room_id)
      .in("status", ["pending_payment", "confirmed", "checked_in"])
      .lte("check_in", createBookingDto.check_out)
      .gte("check_out", createBookingDto.check_in);

    if (conflictError) {
      console.error("Conflict check error:", conflictError);
      throw new BadRequestException(
        "Erreur lors de la vérification de disponibilité",
      );
    }

    if (conflictingBookings && conflictingBookings.length > 0) {
      throw new BadRequestException(
        "Cette chambre n'est pas disponible pour ces dates",
      );
    }

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

    // Créer la réservation en statut pending_payment (verrouillée)
    const { data: booking, error: createError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        room_id: createBookingDto.room_id,
        hotel_id: createBookingDto.hotel_id,
        check_in: createBookingDto.check_in,
        check_out: createBookingDto.check_out,
        adults: createBookingDto.adults,
        children: createBookingDto.children || 0,
        infants: createBookingDto.infants || 0,
        guests: totalGuests,
        total_nights: numberOfNights,
        room_price_per_night: roomPricePerNight,
        taxes_total: taxesTotal,
        extras_total: 0,
        discount_amount: 0,
        commission_amount: 0,
        total_price: totalPrice,
        status: "pending_payment",
        locked_until: lockedUntil,
        booking_reference: bookingReference,
        channel: "direct_website",
        special_requests: createBookingDto.special_requests,
        arrival_time: createBookingDto.arrival_time,
        early_checkin: createBookingDto.early_checkin || false,
        late_checkout: createBookingDto.late_checkout || false,
      })
      .select()
      .single();

    if (createError || !booking) {
      console.error("Booking creation error:", createError);
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
