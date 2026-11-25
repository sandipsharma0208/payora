import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database via Prisma');
    } catch (error: any) {
      this.logger.warn(`Could not connect to PostgreSQL database directly: ${error?.message || error}`);
      this.logger.warn('Running with Prisma schema configured for PostgreSQL.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
