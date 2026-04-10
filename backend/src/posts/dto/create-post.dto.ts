import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Mi primer post' })
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  title: string;

  @ApiProperty({ example: 'Contenido del post...' })
  @IsString()
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  content: string;

  @ApiProperty({ example: 1, description: 'ID del usuario guardado que es autor' })
  @IsInt({ message: 'El authorUserId debe ser un número entero' })
  authorUserId: number;
}
