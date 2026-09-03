import { ConfigService } from '@nestjs/config';
import { Kysely } from 'kysely';
import { DATABASE_CONNECTION, createKysely, resolveBossConnectionString } from './database.provider.js';

describe('database.provider', () => {
  it('exposes DATABASE_CONNECTION token', () => {
    expect(DATABASE_CONNECTION).toBe('DATABASE_CONNECTION');
  });

  it('factory prefers DATABASE_URL connectionString when set', () => {
    const store: Record<string, string | number> = {
      DATABASE_URL: 'postgres://postgres:password@localhost:5432/example_test',
    };
    const config = {
      get: (key: string) => store[key],
      getOrThrow: (key: string) => {
        throw new Error(`missing ${key}`);
      },
    } as unknown as ConfigService;
    const db = createKysely(config);
    expect(db).toBeInstanceOf(Kysely);
    return db.destroy();
  });

  it('factory returns a Kysely instance without connecting', () => {
    const getOrThrow = (key: string) => {
      const vals: Record<string, string | number> = {
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USER: 'postgres',
        DB_PASSWORD: 'postgres',
        DB_NAME: 'example',
      };
      return vals[key];
    };
    const config = {
      get: (_key: string) => undefined,
      getOrThrow,
    } as unknown as ConfigService;
    const db = createKysely(config);
    expect(db).toBeInstanceOf(Kysely);
    return db.destroy();
  });
});

describe('resolveBossConnectionString', () => {
  it('returns DATABASE_URL when set', () => {
    const config = {
      get: (key: string) =>
        key === 'DATABASE_URL'
          ? 'postgres://postgres:password@localhost:5432/example_test'
          : undefined,
      getOrThrow: (key: string) => {
        throw new Error(`missing ${key}`);
      },
    } as unknown as ConfigService;
    expect(resolveBossConnectionString(config)).toBe(
      'postgres://postgres:password@localhost:5432/example_test',
    );
  });

  it('assembles from discrete vars with encoded password otherwise', () => {
    const vals: Record<string, string | number> = {
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USER: 'postgres',
      DB_PASSWORD: 'p@ss:word',
      DB_NAME: 'example',
    };
    const config = {
      get: (_key: string) => undefined,
      getOrThrow: (key: string) => vals[key],
    } as unknown as ConfigService;
    expect(resolveBossConnectionString(config)).toBe(
      'postgres://postgres:p%40ss%3Aword@localhost:5432/example',
    );
  });
});
