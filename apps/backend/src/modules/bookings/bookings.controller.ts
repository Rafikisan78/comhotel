import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(req.user.userId || req.user.sub, createBookingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  findMyBookings(@Request() req: any) {
    return this.bookingsService.findAllByUser(req.user.userId || req.user.sub);
  }

  // Endpoint public pour vérifier la disponibilité (pas besoin d'authentification)
  @Get('check-availability')
  async checkAvailability(
    @Query('room_id') roomId: string,
    @Query('check_in') checkIn: string,
    @Query('check_out') checkOut: string,
  ) {
    const available = await this.bookingsService.checkAvailability(roomId, checkIn, checkOut);
    return { available };
  }

  // Récupérer les périodes réservées pour un hôtel (pour le calendrier)
  @Get('hotel/:hotelId/calendar')
  getHotelCalendar(@Param('hotelId') hotelId: string) {
    return this.bookingsService.getHotelBookedPeriods(hotelId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.bookingsService.findOne(id, req.user.userId || req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  cancel(@Request() req: any, @Param('id') id: string, @Body('reason') reason?: string) {
    return this.bookingsService.cancel(id, req.user.userId || req.user.sub, reason);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  findAll() {
    return this.bookingsService.findAll();
  }
}
