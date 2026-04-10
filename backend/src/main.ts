import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite al front en localhost:3000 hacer peticiones con cookies
  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL]
      : /^http:\/\/localhost:\d+$/,
    credentials: true,
  });

  // Parsea las cookies de cada petición
  app.use(cookieParser());

  // Valida automáticamente los DTOs en todos los endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // lanza error si vienen propiedades extra
      transform: true, // convierte tipos automáticamente (string -> number, etc.)
    }),
  );

  // Swagger disponible en /api
  const config = new DocumentBuilder()
    .setTitle('Fullstack Challenge API')
    .setDescription('API de gestión de usuarios y posts')
    .setVersion('1.0')
    .addCookieAuth('token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Swagger disponible en http://localhost:${port}/api`);
}
bootstrap();
