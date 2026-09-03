import { WelcomeEmailProcessor } from './welcome-email.processor.js';

function row(id: number, sent: boolean) {
  return {
    id,
    email: `u${id}@x.com`,
    name: null,
    welcome_email_sent: sent,
    created_at: new Date(),
  };
}

describe('WelcomeEmailProcessor enqueue', () => {
  it('schedules one send-welcome-email job per unsent user', async () => {
    const scheduled: { name: string; data: unknown }[] = [];
    const repo = { findUnsent: () => Promise.resolve([row(1, false), row(2, false)]) };
    const boss = {
      scheduleJob: (name: string, data: unknown) => {
        scheduled.push({ name, data });
        return Promise.resolve();
      },
    };
    const email = { sendWelcomeEmail: () => Promise.resolve() };
    const processor = new WelcomeEmailProcessor(repo as never, email as never, boss as never);
    await processor.enqueuePendingWelcomeEmails();
    expect(scheduled).toEqual([
      { name: 'send-welcome-email', data: { userId: 1 } },
      { name: 'send-welcome-email', data: { userId: 2 } },
    ]);
  });

  it('schedules nothing when no users are unsent', async () => {
    let calls = 0;
    const repo = { findUnsent: () => Promise.resolve([]) };
    const boss = {
      scheduleJob: () => {
        calls += 1;
        return Promise.resolve();
      },
    };
    const email = { sendWelcomeEmail: () => Promise.resolve() };
    const processor = new WelcomeEmailProcessor(repo as never, email as never, boss as never);
    await processor.enqueuePendingWelcomeEmails();
    expect(calls).toBe(0);
  });
});

describe('WelcomeEmailProcessor handler', () => {
  it('sends and marks sent for an unsent user', async () => {
    const sent: unknown[] = [];
    const marked: number[] = [];
    const repo = {
      findById: () => Promise.resolve(row(1, false)),
      markWelcomeEmailSent: (id: number) => {
        marked.push(id);
        return Promise.resolve();
      },
    };
    const email = {
      sendWelcomeEmail: (user: unknown) => {
        sent.push(user);
        return Promise.resolve();
      },
    };
    const boss = { scheduleJob: () => Promise.resolve() };
    const processor = new WelcomeEmailProcessor(repo as never, email as never, boss as never);
    await processor.handleSendWelcomeEmail([{ data: { userId: 1 } } as never]);
    expect(sent).toHaveLength(1);
    expect(marked).toEqual([1]);
  });

  it('skips users already marked sent', async () => {
    let sends = 0;
    let marks = 0;
    const repo = {
      findById: () => Promise.resolve(row(1, true)),
      markWelcomeEmailSent: () => {
        marks += 1;
        return Promise.resolve();
      },
    };
    const email = {
      sendWelcomeEmail: () => {
        sends += 1;
        return Promise.resolve();
      },
    };
    const boss = { scheduleJob: () => Promise.resolve() };
    const processor = new WelcomeEmailProcessor(repo as never, email as never, boss as never);
    await processor.handleSendWelcomeEmail([{ data: { userId: 1 } } as never]);
    expect(sends).toBe(0);
    expect(marks).toBe(0);
  });

  it('skips missing users without sending', async () => {
    let sends = 0;
    const repo = {
      findById: () => Promise.resolve(undefined),
      markWelcomeEmailSent: () => Promise.resolve(),
    };
    const email = {
      sendWelcomeEmail: () => {
        sends += 1;
        return Promise.resolve();
      },
    };
    const boss = { scheduleJob: () => Promise.resolve() };
    const processor = new WelcomeEmailProcessor(repo as never, email as never, boss as never);
    await processor.handleSendWelcomeEmail([{ data: { userId: 999 } } as never]);
    expect(sends).toBe(0);
  });
});
