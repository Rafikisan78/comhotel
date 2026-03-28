import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  MinLength,
  MaxLength,
} from "class-validator";

export enum RoomType {
  SINGLE = "single",
  DOUBLE = "double",
  TWIN = "twin",
  TRIPLE = "triple",
  QUAD = "quad",
  SUITE = "suite",
  DELUXE = "deluxe",
  PRESIDENTIAL = "presidential",
  STUDIO = "studio",
  FAMILY = "family",
  ACCESSIBLE = "accessible",
}

export enum ViewType {
  CITY = "city",
  SEA = "sea",
  MOUNTAIN = "mountain",
  GARDEN = "garden",
  POOL = "pool",
  COURTYARD = "courtyard",
  STREET = "street",
  INTERIOR = "interior",
}

export class CreateRoomDto {
  @IsUUID()
  @IsNotEmpty()
  hotel_id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  room_number: string;

  @IsEnum(RoomType)
  @IsNotEmpty()
  room_type: RoomType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  floor?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(10)
  capacity_adults: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  capacity_children?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  capacity_infants?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100000)
  base_price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1000)
  size_sqm?: number;

  @IsEnum(ViewType)
  @IsOptional()
  view_type?: ViewType;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_accessible?: boolean;

  @IsBoolean()
  @IsOptional()
  is_smoking_allowed?: boolean;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
