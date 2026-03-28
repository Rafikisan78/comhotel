import { UserRole } from "../dto/create-user.dto";

export class User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneCountryCode?: string;
  role: UserRole;
  avatarUrl?: string;

  // Préférences
  languagePreference?: string;
  currencyPreference?: string;

  // Entreprise (pour les clients B2B)
  companyName?: string;
  companyVat?: string;

  // Programme de fidélité
  loyaltyPoints: number;
  loyaltyTier: string;

  // Email confirmation
  emailConfirmed: boolean;
  emailConfirmationToken?: string;
  emailConfirmationSentAt?: Date;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;

  // Password reset
  passwordResetToken?: string;
  passwordResetExpiresAt?: Date;

  // Account status
  isActive: boolean;
  deletedAt?: Date;
  deletedBy?: string;

  // Login security
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  accountLockedUntil?: Date;

  // Préférences JSON
  preferences?: Record<string, any>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
