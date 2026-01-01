import { IsEmail, IsString, MinLength, IsOptional, IsEnum, MaxLength, Matches } from 'class-validator';

export enum UserRole {
  GUEST = 'guest',
  HOTEL_OWNER = 'hotel_owner',
  ADMIN = 'admin',
}

export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes',
  })
  firstName: string;

  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes',
  })
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
