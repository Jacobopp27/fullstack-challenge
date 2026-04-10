import {
  Injectable,
  UnauthorizedException,
  BadGatewayException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

const REQRES_URL = 'https://reqres.in/api';

@Injectable()
export class AuthService {
  async login(dto: LoginDto): Promise<{ token: string }> {
    let response: Response;

    try {
      response = await fetch(`${REQRES_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REQRES_API_KEY ?? '',
        },
        body: JSON.stringify(dto),
      });
    } catch {
      // ReqRes no respondió (problema de red)
      throw new BadGatewayException('No se pudo conectar con el servicio de autenticación');
    }

    if (response.status === 400) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!response.ok) {
      throw new BadGatewayException('Error inesperado del servicio de autenticación');
    }

    const data = (await response.json()) as { token: string };
    return { token: data.token };
  }
}
