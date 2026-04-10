import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreatePostDto) {
    return this.prisma.post.create({
      data,
      include: { author: true },
    });
  }

  // Devuelve los posts con paginación y el autor incluido
  findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count(),
    ]);
  }

  findById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  update(id: string, data: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data,
      include: { author: true },
    });
  }

  delete(id: string) {
    return this.prisma.post.delete({ where: { id } });
  }
}
