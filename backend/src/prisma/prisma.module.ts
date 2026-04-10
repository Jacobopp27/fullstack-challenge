import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global para no tener que importarlo en cada módulo
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
