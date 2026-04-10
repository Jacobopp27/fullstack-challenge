import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Verifica que la petición tenga un token válido en la cookie o en el header
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Si el endpoint tiene @Public(), dejamos pasar sin token
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token =
      request.cookies?.token ??
      request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Se requiere autenticación');
    }

    // Guardamos el token en el request para que los controladores puedan usarlo
    (request as any).token = token;
    return true;
  }
}
