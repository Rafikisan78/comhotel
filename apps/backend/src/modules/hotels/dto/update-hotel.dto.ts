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

export class UpdateHotelDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(50)
  description?: string;

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

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{5}$/)
  zip_code?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  country?: string;

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

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\s\-()]{10,20}$/)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
  check_in_time?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
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

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  star_rating?: number;

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MinLength(3)
  @MaxLength(255)
  slug?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_rate?: number;
}
