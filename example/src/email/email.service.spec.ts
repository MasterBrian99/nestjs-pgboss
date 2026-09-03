import { Logger } from '@nestjs/common';
import { vi } from 'vitest';
import { EmailService } from './email.service.js';

describe('EmailService', () => {
  it('logs the recipient and resolves without sending', async () => {
    const logs: string[] = [];
    const spy = vi
      .spyOn(Logger.prototype, 'log')
      .mockImplementation((message?: unknown) => {
        logs.push(String(message));
      });
    try {
      const service = new EmailService();
      const user = {
        id: 3,
        email: 'c@x.com',
        name: null,
        welcome_email_sent: false,
        created_at: new Date(),
      };
      await expect(service.sendWelcomeEmail(user)).resolves.toBeUndefined();
      expect(logs).toEqual(['Welcome email sent to c@x.com (user 3)']);
    } finally {
      spy.mockRestore();
    }
  });
});
