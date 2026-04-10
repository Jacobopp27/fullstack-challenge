import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, PostsModule],
  providers: [
    // Aplica el filtro de errores a toda la app
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    // Aplica el guard de autenticación a todos los endpoints por defecto
    { provide: APP_GUARD, useClass: AuthGuard },
    // Aplica el guard de roles (solo actúa si el endpoint tiene @Roles)
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Añade X-Request-Id a todas las peticiones
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
