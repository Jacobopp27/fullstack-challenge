import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';

// Usuario de prueba que simula estar guardado en la DB
const mockUser = {
  id: 1,
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  avatar: 'https://example.com/avatar.jpg',
  role: 'USER',
  savedAt: new Date(),
};

const mockPost = {
  id: 'clx123',
  title: 'Post de prueba',
  content: 'Contenido del post de prueba largo',
  authorUserId: 1,
  author: mockUser,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PostsService', () => {
  let service: PostsService;
  let postsRepository: jest.Mocked<PostsRepository>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PostsRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postsRepository = module.get(PostsRepository);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('crea el post cuando el autor existe', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      postsRepository.create.mockResolvedValueOnce(mockPost as any);

      const result = await service.create({
        title: 'Post de prueba',
        content: 'Contenido del post de prueba largo',
        authorUserId: 1,
      });

      expect(result).toEqual(mockPost);
    });

    it('lanza BadRequestException si el autor no está guardado', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.create({
          title: 'Post',
          content: 'Contenido suficientemente largo',
          authorUserId: 999,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('lanza NotFoundException si el post no existe', async () => {
      postsRepository.findById.mockResolvedValueOnce(null);

      await expect(service.findById('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
