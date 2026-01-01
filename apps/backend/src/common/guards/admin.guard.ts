import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentification requise');
    }

    // Seuls les admins peuvent accéder
    if (user.role === 'admin') {
      return true;
    }

    throw new ForbiddenException('Accès réservé aux administrateurs');
  }
}
