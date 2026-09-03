import { Inject, Injectable } from '@nestjs/common';
import type { Kysely, Selectable } from 'kysely';
import { DATABASE_CONNECTION } from '../database/database.provider.js';
import type { Database, UsersTable } from '../database/database.types.js';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Kysely<Database>,
  ) {}

  async findById(id: number): Promise<Selectable<UsersTable> | undefined> {
    return this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByEmail(email: string): Promise<Selectable<UsersTable> | undefined> {
    return this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();
  }

  async create(input: {
    email: string;
    name?: string | null;
  }): Promise<Selectable<UsersTable>> {
    return this.db
      .insertInto('users')
      .values({ email: input.email, name: input.name ?? null })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findUnsent(): Promise<Selectable<UsersTable>[]> {
    return this.db
      .selectFrom('users')
      .selectAll()
      .where('welcome_email_sent', '=', false)
      .orderBy('id')
      .execute();
  }

  async markWelcomeEmailSent(id: number): Promise<void> {
    await this.db
      .updateTable('users')
      .set({ welcome_email_sent: true })
      .where('id', '=', id)
      .executeTakeFirst();
  }
}
