import { Injectable, Logger } from '@nestjs/common';
import type { Selectable } from 'kysely';
import type { UsersTable } from '../database/database.types.js';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendWelcomeEmail(user: Selectable<UsersTable>): Promise<void> {
    this.logger.log(`Welcome email sent to ${user.email} (user ${user.id})`);
  }
}
