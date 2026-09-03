import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from './database.types.js';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export function createKysely(config: ConfigService): Kysely<Database> {
  const connectionString = config.get<string>('DATABASE_URL');
  const pool = connectionString
    ? new Pool({ connectionString })
    : new Pool({
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<string>('DB_PORT')),
        user: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
      });
  pool.on('error', (err) => {
    new Logger('PostgresPool').error(err.message, err.stack);
  });
  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
  });
}

export function resolveBossConnectionString(config: ConfigService): string {
  const url = config.get<string>('DATABASE_URL');
  if (url) {
    return url;
  }
  const host = config.getOrThrow<string>('DB_HOST');
  const port = Number(config.getOrThrow<string>('DB_PORT'));
  const user = config.getOrThrow<string>('DB_USER');
  const password = config.getOrThrow<string>('DB_PASSWORD');
  const database = config.getOrThrow<string>('DB_NAME');
  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}
