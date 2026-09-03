import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PgBossModule } from '@wavezync/nestjs-pgboss';
import { resolveBossConnectionString } from './database/database.provider.js';
import Joi from 'joi';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { EmailModule } from './email/email.module.js';
import { UsersModule } from './users/users.module.js';

// DB_* vars are required unless a single DATABASE_URL is provided.
function requiredUnlessUrl(schema: Joi.StringSchema): Joi.StringSchema {
  return process.env.DATABASE_URL ? schema.optional() : schema.required();
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string()
          .uri({ scheme: ['postgres', 'postgresql'] })
          .optional(),
        DB_HOST: requiredUnlessUrl(Joi.string()),
        DB_PORT: Joi.number().port().default(5432),
        DB_USER: requiredUnlessUrl(Joi.string()),
        DB_PASSWORD: requiredUnlessUrl(Joi.string()),
        DB_NAME: requiredUnlessUrl(Joi.string()),
      }),
    }),
    DatabaseModule,
    PgBossModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connectionString: resolveBossConnectionString(config),
        retryLimit:3,
      }),
    }),
    UsersModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
