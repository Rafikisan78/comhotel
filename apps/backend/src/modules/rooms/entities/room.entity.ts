import { RoomType, ViewType } from "../dto/create-room.dto";

export interface Room {
  id: string;
  hotel_id: string;
  room_number: string;
  room_type: RoomType;
  floor?: number;
  capacity_adults: number;
  capacity_children?: number;
  capacity_infants?: number;
  base_price: number;
  size_sqm?: number;
  view_type?: ViewType;
  description?: string;
  is_accessible?: boolean;
  is_smoking_allowed?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
