import { IsEmail, IsString, MinLength, IsOptional, MaxLength, Matches } from 'class-validator';

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
  @MinLength(12, {
    message: 'Le mot de passe doit contenir au moins 12 caractères',
  })
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-+=#])[A-Za-z\d@$!%*?&._\-+=#]+$/, {
    message: 'Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (@$!%*?&._-+=#)',
  })
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
