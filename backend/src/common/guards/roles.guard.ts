import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

// Verifica que el usuario tenga el rol necesario para acceder al endpoint
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no se especificaron roles, cualquiera puede acceder
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();

    // El userId viene del header que manda el frontend con cada petición
    const userId = request.headers['x-user-id'];
    if (!userId) {
      throw new ForbiddenException('No se encontró el usuario en la sesión');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('No tienes permisos para esta acción');
    }

    // Ponemos el usuario completo en el request para usarlo en el controlador
    request.user = user;
    return true;
  }
}
