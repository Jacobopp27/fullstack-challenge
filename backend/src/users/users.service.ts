import {
  Injectable,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';

const REQRES_URL = 'https://reqres.in/api';

function reqresHeaders(): Record<string, string> {
  return { 'x-api-key': process.env.REQRES_API_KEY ?? '' };
}

// Estructura que devuelve ReqRes en el detalle de un usuario
interface ReqResUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  // Trae la lista paginada desde ReqRes (el front decide la página)
  async getFromReqRes(page: number) {
    let response: Response;
    try {
      response = await fetch(`${REQRES_URL}/users?page=${page}`, { headers: reqresHeaders() });
    } catch {
      throw new BadGatewayException('No se pudo conectar con ReqRes');
    }

    if (!response.ok) {
      throw new BadGatewayException('Error al obtener usuarios de ReqRes');
    }

    return response.json();
  }

  // Trae el detalle de un usuario específico desde ReqRes
  async getOneFromReqRes(id: number) {
    let response: Response;
    try {
      response = await fetch(`${REQRES_URL}/users/${id}`, { headers: reqresHeaders() });
    } catch {
      throw new BadGatewayException('No se pudo conectar con ReqRes');
    }

    if (response.status === 404) {
      throw new NotFoundException(`Usuario ${id} no existe en ReqRes`);
    }
    if (!response.ok) {
      throw new BadGatewayException('Error al obtener el usuario de ReqRes');
    }

    const body = (await response.json()) as { data: ReqResUser };
    return body.data;
  }

  // Descarga el usuario de ReqRes y lo guarda en la DB local
  async importUser(id: number) {
    const reqResUser = await this.getOneFromReqRes(id);

    return this.usersRepository.upsert({
      id: reqResUser.id,
      email: reqResUser.email,
      firstName: reqResUser.first_name,
      lastName: reqResUser.last_name,
      avatar: reqResUser.avatar,
    });
  }

  findAllSaved() {
    return this.usersRepository.findAll();
  }

  async findSavedById(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`Usuario ${id} no está guardado localmente`);
    return user;
  }

  async deleteSaved(id: number) {
    await this.findSavedById(id); // verifica que exista antes de borrar
    return this.usersRepository.delete(id);
  }
}
