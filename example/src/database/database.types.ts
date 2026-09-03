import type { Generated } from 'kysely';

export interface UsersTable {
  id: Generated<number>;
  email: string;
  name: string | null;
  welcome_email_sent: Generated<boolean>;
  created_at: Generated<Date>;
}

export interface Database {
  users: UsersTable;
}
