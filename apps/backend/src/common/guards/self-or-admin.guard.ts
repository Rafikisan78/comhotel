import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const targetUserId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Authentification requise');
    }

    // Admin peut tout faire
    if (user.role === 'admin') {
      return true;
    }

    // L'utilisateur peut modifier son propre profil
    if (user.userId === targetUserId || user.sub === targetUserId) {
      return true;
    }

    throw new ForbiddenException('Vous ne pouvez modifier que votre propre profil');
  }
}
