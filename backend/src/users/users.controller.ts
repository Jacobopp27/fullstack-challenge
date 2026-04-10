import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Devuelve los usuarios de ReqRes para mostrarlos en el listado del front
  @Get('reqres')
  @ApiOperation({ summary: 'Listar usuarios de ReqRes (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getFromReqRes(@Query('page') page = 1) {
    return this.usersService.getFromReqRes(Number(page));
  }

  // Importa un usuario de ReqRes y lo guarda en la DB
  @Post('import/:id')
  @ApiOperation({ summary: 'Importar usuario de ReqRes a la DB local' })
  importUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.importUser(id);
  }

  // Lista los usuarios que ya fueron guardados localmente
  @Get('saved')
  @ApiOperation({ summary: 'Listar usuarios guardados localmente' })
  findAllSaved() {
    return this.usersService.findAllSaved();
  }

  // Detalle de un usuario guardado
  @Get('saved/:id')
  @ApiOperation({ summary: 'Obtener usuario guardado por ID' })
  findSavedById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findSavedById(id);
  }

  // Solo los admins pueden eliminar usuarios guardados
  @Delete('saved/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar usuario guardado (solo ADMIN)' })
  deleteSaved(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteSaved(id);
  }
}
