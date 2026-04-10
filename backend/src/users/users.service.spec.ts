import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

global.fetch = jest.fn();

const mockUser = {
  id: 1,
  email: 'george.bluth@reqres.in',
  firstName: 'George',
  lastName: 'Bluth',
  avatar: 'https://reqres.in/img/faces/1-image.jpg',
  role: 'USER',
  savedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            upsert: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
    jest.clearAllMocks();
  });

  describe('importUser', () => {
    it('guarda el usuario cuando ReqRes responde correctamente', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            id: 1,
            email: 'george.bluth@reqres.in',
            first_name: 'George',
            last_name: 'Bluth',
            avatar: 'https://reqres.in/img/faces/1-image.jpg',
          },
        }),
      });
      usersRepository.upsert.mockResolvedValueOnce(mockUser as any);

      const result = await service.importUser(1);
      expect(result).toEqual(mockUser);
      expect(usersRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, email: 'george.bluth@reqres.in' }),
      );
    });

    it('lanza NotFoundException si el usuario no existe en ReqRes', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(service.importUser(999)).rejects.toThrow(NotFoundException);
    });

    it('lanza BadGatewayException si ReqRes no responde', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.importUser(1)).rejects.toThrow(BadGatewayException);
    });
  });
});
