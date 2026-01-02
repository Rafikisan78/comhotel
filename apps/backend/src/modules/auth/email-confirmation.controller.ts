import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';

/**
 * Controller dédié à la gestion de la confirmation email
 * N'impacte pas les endpoints existants /auth/register et /auth/login
 */
@Controller('auth/email')
export class EmailConfirmationController {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * POST /auth/email/verify
   * Vérifier l'email après clic sur le lien de confirmation
   * Body: { token_hash: string, type?: 'signup' | 'email_change' }
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() body: { token_hash: string; type?: 'signup' | 'email_change' },
  ) {
    if (!body.token_hash) {
      throw new BadRequestException('Token manquant');
    }

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: body.token_hash,
      type: body.type || 'signup',
    });

    if (error) {
      throw new BadRequestException('Lien de confirmation invalide ou expiré');
    }

    if (!data.user) {
      throw new BadRequestException('Erreur lors de la confirmation');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        emailConfirmed: true,
        confirmedAt: data.user.email_confirmed_at,
      },
      session: data.session,
      message: 'Email confirmé avec succès !',
    };
  }

  /**
   * POST /auth/email/resend
   * Renvoyer l'email de confirmation
   * Body: { email: string }
   */
  @Post('resend')
  @HttpCode(HttpStatus.OK)
  async resendConfirmation(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email requis');
    }

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: body.email.toLowerCase().trim(),
    });

    if (error) {
      throw new BadRequestException(
        'Impossible de renvoyer l\'email. Veuillez réessayer dans quelques instants.',
      );
    }

    return {
      message: 'Email de confirmation renvoyé. Vérifiez votre boîte de réception.',
    };
  }

  /**
   * POST /auth/email/check-status
   * Vérifier si un email a été confirmé
   * Body: { email: string }
   */
  @Post('check-status')
  @HttpCode(HttpStatus.OK)
  async checkEmailStatus(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email requis');
    }

    const supabase = this.supabaseService.getClient();

    // Essayer de récupérer l'utilisateur depuis auth.users via admin API
    const { data } = await supabase.auth.admin.listUsers();

    const user = data?.users?.find(
      (u: any) => u.email?.toLowerCase() === body.email.toLowerCase(),
    );

    if (!user) {
      return {
        exists: false,
        confirmed: false,
        message: 'Utilisateur non trouvé',
      };
    }

    return {
      exists: true,
      confirmed: user.email_confirmed_at !== null,
      confirmedAt: user.email_confirmed_at,
      message: user.email_confirmed_at
        ? 'Email confirmé'
        : 'Email non confirmé',
    };
  }
}
