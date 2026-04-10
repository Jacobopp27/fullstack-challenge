import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Prisma 7 requiere pasar el adapter con la conexión a la DB
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  // Abre la conexión cuando arranca el módulo
  async onModuleInit() {
    await this.$connect();
  }

  // Cierra la conexión cuando apaga el módulo
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
