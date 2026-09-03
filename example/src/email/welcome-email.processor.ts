import { Injectable, Logger } from '@nestjs/common';
import { CronJob, Job, PgBossService } from '@wavezync/nestjs-pgboss';
import type { JobWithMetadata } from 'pg-boss';
import { UsersRepository } from '../users/users.repository.js';
import { EmailService } from './email.service.js';

interface SendWelcomeEmailData {
  userId: number;
}

@Injectable()
export class WelcomeEmailProcessor {
  private readonly logger = new Logger(WelcomeEmailProcessor.name);

  constructor(
    private readonly users: UsersRepository,
    private readonly email: EmailService,
    private readonly boss: PgBossService,
  ) {}

  @CronJob('send-pending-welcome-emails', '* * * * *', {
    retryLimit: 1,
  })
  async enqueuePendingWelcomeEmails(): Promise<void> {
    const pending = await this.users.findUnsent();
    for (const user of pending) {
      await this.boss.scheduleJob('send-welcome-email', { userId: user.id });
    }
    if (pending.length > 0) {
      this.logger.log(`Enqueued ${pending.length} welcome-email job(s)`);
    }
  }

  @Job(
    'send-welcome-email',
    {
      minPriority: 2,
    },
    {
      retryLimit: 2,
    },
  )
  async handleSendWelcomeEmail(
    jobs: JobWithMetadata<SendWelcomeEmailData>[],
  ): Promise<void> {
    for (const job of jobs) {
      const user = await this.users.findById(job.data.userId);
      if (!user) {
        this.logger.warn(
          `Skipping welcome email: user ${job.data.userId} not found`,
        );
        continue;
      }
      if (user.welcome_email_sent) {
        continue;
      }
      await this.email.sendWelcomeEmail(user);
      await this.users.markWelcomeEmailSent(user.id);
    }
  }
}
