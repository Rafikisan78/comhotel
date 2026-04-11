import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEmail,
  IsUrl,
  Min,
  Max,
  MaxLength,
  MinLength,
  Matches,
} from "class-validator";

export class CreateHotelDto {
  @IsString()
  @MinLength(3, {
    message: "Le nom de l'hôtel doit contenir au moins 3 caractères",
  })
  @MaxLength(255, {
    message: "Le nom de l'hôtel ne peut pas dépasser 255 caractères",
  })
  name: string;

  @IsString()
  @MinLength(50, {
    message: "La description doit contenir au moins 50 caractères",
  })
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  short_description?: string;

  @IsOptional()
  @IsString()
  description_en?: string;

  @IsOptional()
  @IsString()
  description_es?: string;

  @IsOptional()
  @IsString()
  description_de?: string;

  // Localisation
  @IsString()
  @MinLength(10, { message: "L'adresse doit contenir au moins 10 caractères" })
  @MaxLength(500)
  address: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(20)
  zip_code: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  country: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  // Coordonnées
  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\s\-()]{10,20}$/, { message: "Format de téléphone invalide" })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: "Format d'email invalide" })
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsUrl({}, { message: "Format d'URL invalide" })
  @MaxLength(255)
  website?: string;

  // Horaires
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: "Format d'heure invalide (HH:MM ou HH:MM:SS)",
  })
  check_in_time?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: "Format d'heure invalide (HH:MM ou HH:MM:SS)",
  })
  check_out_time?: string;

  @IsOptional()
  @IsBoolean()
  reception_24h?: boolean;

  @IsOptional()
  reception_hours?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  arrival_instructions?: string;

  // Classification
  @IsNumber()
  @Min(1, { message: "Le nombre d'étoiles doit être entre 1 et 5" })
  @Max(5, { message: "Le nombre d'étoiles doit être entre 1 et 5" })
  star_rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  chain_name?: string;

  @IsOptional()
  @IsBoolean()
  is_independent?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  // Média
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @IsOptional()
  @IsUrl()
  cover_image?: string;

  @IsOptional()
  @IsUrl()
  video_url?: string;

  @IsOptional()
  @IsUrl()
  virtual_tour_url?: string;

  // Équipements (legacy)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  // SEO
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message:
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets",
  })
  @MinLength(3)
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  // Plateforme
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_rate?: number;
}
