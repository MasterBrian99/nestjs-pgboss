import { defineConfig } from 'kysely-ctl';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'example',
    });

export default defineConfig({
  dialect: new PostgresDialect({ pool }),
  migrations: {
    migrationFolder: 'src/database/migrations',
  },
});
