export interface Hotel {
  id: string;
  name: string;
  description: string;
  description_en?: string;
  description_es?: string;
  description_de?: string;
  short_description?: string;

  // Localisation
  address: string;
  city: string;
  zip_code: string;
  country: string;
  latitude?: number;
  longitude?: number;

  // Coordonnées
  phone?: string;
  email?: string;
  website?: string;

  // Horaires
  check_in_time?: string; // "15:00:00"
  check_out_time?: string; // "11:00:00"
  reception_24h?: boolean;
  reception_hours?: Record<string, any>;
  arrival_instructions?: string;

  // Classification
  star_rating: number; // 1-5
  chain_name?: string;
  is_independent?: boolean;
  labels?: string[]; // ["Eco-label", "Qualité Tourisme"]
  certifications?: string[]; // ["ISO", "Green Globe"]

  // Média
  images?: string[]; // URLs des images (legacy)
  cover_image?: string;
  video_url?: string;
  virtual_tour_url?: string;

  // Équipements
  amenities?: string[]; // Legacy array

  // SEO et affichage
  slug?: string; // "paris-hotel-plaza"
  is_active?: boolean;
  is_featured?: boolean;

  // Statistiques
  average_rating?: number;
  total_reviews?: number;

  // Plateforme
  commission_rate?: number; // 15.00 = 15%

  // Propriétaire
  owner_id?: string;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface HotelImage {
  id: string;
  hotel_id: string;
  url: string;
  title?: string;
  description?: string;
  category:
    | "facade"
    | "lobby"
    | "restaurant"
    | "pool"
    | "room"
    | "bathroom"
    | "view"
    | "other";
  display_order: number;
  is_cover: boolean;
  width?: number;
  height?: number;
  file_size?: number;
  photographer?: string;
  created_at: Date;
}

export interface HotelAmenity {
  id: string;
  code: string; // "wifi_free", "pool_outdoor"
  name_fr: string;
  name_en: string;
  name_es?: string;
  name_de?: string;
  category:
    | "connectivity"
    | "wellness"
    | "services"
    | "transport"
    | "family"
    | "business"
    | "dining"
    | "accessibility";
  icon?: string;
  is_premium: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface HotelAmenityAssignment {
  id: string;
  hotel_id: string;
  amenity_id: string;
  is_free: boolean;
  price?: number;
  currency?: string;
  notes?: string;
  created_at: Date;
}
