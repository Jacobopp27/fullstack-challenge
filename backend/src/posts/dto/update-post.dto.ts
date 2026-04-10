import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

// PartialType hace que todos los campos de CreatePostDto sean opcionales
export class UpdatePostDto extends PartialType(CreatePostDto) {}
