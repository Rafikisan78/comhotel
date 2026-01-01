export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  starRating: number;
  images: string[];
  amenities: string[];
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHotelDto {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  starRating: number;
  images?: string[];
  amenities?: string[];
}

export interface UpdateHotelDto {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  starRating?: number;
  images?: string[];
  amenities?: string[];
}

export interface HotelSearchQuery {
  city?: string;
  country?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number;
  amenities?: string[];
}
