import { Global, Inject, Module, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Kysely } from 'kysely';
import { DATABASE_CONNECTION, createKysely } from './database.provider.js';
import type { Database } from './database.types.js';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => createKysely(config),
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Kysely<Database>,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.db.destroy();
  }
}
