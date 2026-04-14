import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AdminGuard } from "../../common/guards/admin.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(
      req.user.userId || req.user.sub,
      createBookingDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("my-bookings")
  findMyBookings(@Request() req: any) {
    return this.bookingsService.findAllByUser(req.user.userId || req.user.sub);
  }

  // Confirmer une réservation en attente de paiement
  @UseGuards(JwtAuthGuard)
  @Patch(":id/confirm")
  confirm(@Request() req: any, @Param("id") id: string) {
    return this.bookingsService.confirm(id, req.user.userId || req.user.sub);
  }

  // Expirer les verrous périmés (peut être appelé par un cron)
  @Post("expire-locks")
  expireLocks() {
    return this.bookingsService.expireLocks();
  }

  // Endpoint public pour vérifier la disponibilité (pas besoin d'authentification)
  @Get("check-availability")
  async checkAvailability(
    @Query("room_id") roomId: string,
    @Query("check_in") checkIn: string,
    @Query("check_out") checkOut: string,
  ) {
    const available = await this.bookingsService.checkAvailability(
      roomId,
      checkIn,
      checkOut,
    );
    return { available };
  }

  // Récupérer toutes les réservations d'un hôtel (hotel owner ou admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("hotel_owner", "admin")
  @Get("hotel/:hotelId/all")
  findAllByHotel(@Request() req: any, @Param("hotelId") hotelId: string) {
    return this.bookingsService.findAllByHotel(
      hotelId,
      req.user.userId || req.user.sub,
      req.user.role,
    );
  }

  // Récupérer les périodes réservées pour un hôtel (dates où TOUTES les chambres sont prises)
  @Get("hotel/:hotelId/calendar")
  getHotelCalendar(@Param("hotelId") hotelId: string) {
    return this.bookingsService.getHotelBookedPeriods(hotelId);
  }

  // Récupérer les réservations détaillées par chambre pour un hôtel
  @Get("hotel/:hotelId/rooms-availability")
  getHotelRoomsAvailability(@Param("hotelId") hotelId: string) {
    return this.bookingsService.getHotelRoomsAvailability(hotelId);
  }

  // Récupérer les périodes réservées pour une chambre spécifique
  @Get("room/:roomId/calendar")
  getRoomCalendar(@Param("roomId") roomId: string) {
    return this.bookingsService.getRoomBookedPeriods(roomId);
  }

  // Modifier une réservation (client)
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Request() req: any,
    @Param("id") id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(
      id,
      req.user.userId || req.user.sub,
      updateBookingDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Request() req: any, @Param("id") id: string) {
    return this.bookingsService.findOne(id, req.user.userId || req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  cancel(
    @Request() req: any,
    @Param("id") id: string,
    @Body("reason") reason?: string,
  ) {
    return this.bookingsService.cancel(
      id,
      req.user.userId || req.user.sub,
      reason,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get("admin/all")
  findAll() {
    return this.bookingsService.findAll();
  }
}
