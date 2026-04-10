import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

type CreateUserData = Omit<User, 'savedAt' | 'role'>;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Busca un usuario guardado por su ID de ReqRes
  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // Devuelve todos los usuarios guardados localmente
  findAll() {
    return this.prisma.user.findMany({ orderBy: { savedAt: 'desc' } });
  }

  // Guarda un usuario. Si ya existe, actualiza sus datos
  upsert(data: CreateUserData) {
    return this.prisma.user.upsert({
      where: { id: data.id },
      update: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar,
      },
      create: data,
    });
  }

  delete(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
