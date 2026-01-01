import { Injectable } from '@nestjs/common';

@Injectable()
export class HotelsService {
  private hotels: any[] = [];

  async create(createHotelDto: any) {
    const hotel = {
      id: Date.now().toString(),
      ...createHotelDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.hotels.push(hotel);
    return hotel;
  }

  async findAll() {
    return this.hotels;
  }

  async findOne(id: string) {
    return this.hotels.find((hotel) => hotel.id === id) || null;
  }

  async update(id: string, updateHotelDto: any) {
    const index = this.hotels.findIndex((hotel) => hotel.id === id);
    if (index === -1) return null;

    this.hotels[index] = {
      ...this.hotels[index],
      ...updateHotelDto,
      updatedAt: new Date(),
    };
    return this.hotels[index];
  }

  async remove(id: string) {
    const index = this.hotels.findIndex((hotel) => hotel.id === id);
    if (index === -1) return false;

    this.hotels.splice(index, 1);
    return true;
  }
}
