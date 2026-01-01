import { Injectable } from '@nestjs/common';

@Injectable()
export class BookingsService {
  private bookings: any[] = [];

  async create(createBookingDto: any) {
    const booking = {
      id: Date.now().toString(),
      ...createBookingDto,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookings.push(booking);
    return booking;
  }

  async findAll() {
    return this.bookings;
  }

  async findOne(id: string) {
    return this.bookings.find((booking) => booking.id === id) || null;
  }

  async update(id: string, updateBookingDto: any) {
    const index = this.bookings.findIndex((booking) => booking.id === id);
    if (index === -1) return null;

    this.bookings[index] = {
      ...this.bookings[index],
      ...updateBookingDto,
      updatedAt: new Date(),
    };
    return this.bookings[index];
  }

  async remove(id: string) {
    const index = this.bookings.findIndex((booking) => booking.id === id);
    if (index === -1) return false;

    this.bookings.splice(index, 1);
    return true;
  }
}
