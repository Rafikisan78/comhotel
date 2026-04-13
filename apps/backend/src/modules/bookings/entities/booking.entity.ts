export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  hotel_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  adults: number;
  children: number;
  infants: number;
  total_price: number;
  total_nights: number;
  room_price_per_night: number;
  status:
    | "pending"
    | "pending_payment"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "expired"
    | "checked_in"
    | "checked_out"
    | "no_show";
  locked_until?: string;
  booking_reference?: string;
  channel: string;
  special_requests?: string;
  arrival_time?: string;
  late_checkout: boolean;
  early_checkin: boolean;
  extras_total: number;
  taxes_total: number;
  discount_amount: number;
  promo_code?: string;
  commission_amount: number;
  cancellation_reason?: string;
  cancelled_at?: string;
  checked_in_at?: string;
  checked_out_at?: string;
  customer_notes?: string;
  internal_notes?: string;
  payment_id?: string;
  payment_method?: "stripe" | "on_site" | null;
  created_at: string;
  updated_at: string;
}
