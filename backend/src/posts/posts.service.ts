import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreatePostDto) {
    // Verificamos que el autor exista en nuestra DB antes de crear el post
    const author = await this.prisma.user.findUnique({
      where: { id: dto.authorUserId },
    });
    if (!author) {
      throw new BadRequestException(
        `El usuario ${dto.authorUserId} no está guardado. Primero importalo desde ReqRes.`,
      );
    }
    return this.postsRepository.create(dto);
  }

  async findAll(page = 1, limit = 10) {
    const [posts, total] = await this.postsRepository.findAll(page, limit);
    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const post = await this.postsRepository.findById(id);
    if (!post) throw new NotFoundException(`Post ${id} no encontrado`);
    return post;
  }

  async update(id: string, dto: UpdatePostDto) {
    await this.findById(id); // verifica que exista

    // Si cambian el autor, verificamos que ese también exista
    if (dto.authorUserId) {
      const author = await this.prisma.user.findUnique({
        where: { id: dto.authorUserId },
      });
      if (!author) {
        throw new BadRequestException(
          `El usuario ${dto.authorUserId} no está guardado localmente`,
        );
      }
    }

    return this.postsRepository.update(id, dto);
  }

  async delete(id: string) {
    await this.findById(id); // verifica que exista
    return this.postsRepository.delete(id);
  }
}
