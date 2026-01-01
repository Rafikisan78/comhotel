export enum RoomType {
  SINGLE = 'single',
  DOUBLE = 'double',
  SUITE = 'suite',
  DELUXE = 'deluxe',
}

export interface Room {
  id: string;
  hotelId: string;
  number: string;
  type: RoomType;
  description: string;
  pricePerNight: number;
  capacity: number;
  images: string[];
  amenities: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomDto {
  hotelId: string;
  number: string;
  type: RoomType;
  description: string;
  pricePerNight: number;
  capacity: number;
  images?: string[];
  amenities?: string[];
}

export interface UpdateRoomDto {
  number?: string;
  type?: RoomType;
  description?: string;
  pricePerNight?: number;
  capacity?: number;
  images?: string[];
  amenities?: string[];
  isAvailable?: boolean;
}
