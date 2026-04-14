import {
  IsDateString,
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";

export class UpdateBookingDto {
  @IsOptional()
  @IsDateString()
  check_in?: string;

  @IsOptional()
  @IsDateString()
  check_out?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  adults?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
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
