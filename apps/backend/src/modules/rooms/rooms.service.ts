import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomsService {
  private rooms: any[] = [];

  async create(createRoomDto: any) {
    const room = {
      id: Date.now().toString(),
      ...createRoomDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rooms.push(room);
    return room;
  }

  async findAll() {
    return this.rooms;
  }

  async findOne(id: string) {
    return this.rooms.find((room) => room.id === id) || null;
  }

  async update(id: string, updateRoomDto: any) {
    const index = this.rooms.findIndex((room) => room.id === id);
    if (index === -1) return null;

    this.rooms[index] = {
      ...this.rooms[index],
      ...updateRoomDto,
      updatedAt: new Date(),
    };
    return this.rooms[index];
  }

  async remove(id: string) {
    const index = this.rooms.findIndex((room) => room.id === id);
    if (index === -1) return false;

    this.rooms.splice(index, 1);
    return true;
  }
}
