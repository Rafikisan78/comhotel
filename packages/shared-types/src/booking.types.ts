export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  hotelId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingDto {
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

export interface UpdateBookingDto {
  status?: BookingStatus;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
}
