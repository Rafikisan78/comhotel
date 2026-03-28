import {
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";

export class CreateBookingDto {
  @IsUUID()
  room_id: string;

  @IsUUID()
  hotel_id: string;

  @IsDateString()
  check_in: string;

  @IsDateString()
  check_out: string;

  @IsInt()
  @Min(1)
  adults: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  children?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  infants?: number;

  @IsOptional()
  @IsString()
  special_requests?: string;

  @IsOptional()
  @IsString()
  arrival_time?: string;

  @IsOptional()
  @IsBoolean()
  early_checkin?: boolean;

  @IsOptional()
  @IsBoolean()
  late_checkout?: boolean;
}
