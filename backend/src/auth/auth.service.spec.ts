import { BadGatewayException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

// Silenciamos fetch para controlar las respuestas en los tests
global.fetch = jest.fn();

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('devuelve el token cuando el login es correcto', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: 'abc123' }),
    });

    const result = await service.login({
      email: 'eve.holt@reqres.in',
      password: 'cityslicka',
    });

    expect(result.token).toBe('abc123');
  });

  it('lanza UnauthorizedException cuando las credenciales son incorrectas', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    await expect(
      service.login({ email: 'wrong@email.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lanza BadGatewayException si ReqRes no responde', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(
      service.login({ email: 'test@test.com', password: 'pass' }),
    ).rejects.toThrow(BadGatewayException);
  });
});
