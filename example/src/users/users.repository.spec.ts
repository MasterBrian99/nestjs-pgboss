import { UsersRepository } from './users.repository.js';

function mockDb(result: unknown) {
  const executeTakeFirstOrThrow = () => Promise.resolve(result);
  const executeTakeFirst = () => Promise.resolve(result);
  const valuesFn = () => ({
    returningAll: () => ({ executeTakeFirstOrThrow }),
    executeTakeFirstOrThrow,
  });
  const insertIntoFn = () => ({ values: valuesFn, columns: () => ({ values: valuesFn }) });
  const whereRef: Record<string, unknown> = {};
  whereRef.where = () => ({ executeTakeFirst });
  whereRef.executeTakeFirst = executeTakeFirst;
  const selectFromFn = () => ({ selectAll: () => whereRef, ...whereRef });
  return { selectFrom: selectFromFn, insertInto: insertIntoFn };
}

describe('UsersRepository', () => {
  it('findById delegates to Kysely and returns row', async () => {
    const row = { id: 1, email: 'a@x.com', name: null, created_at: new Date() };
    const repo = new UsersRepository(mockDb(row) as never);
    await expect(repo.findById(1)).resolves.toEqual(row);
  });

  it('create inserts and returns row', async () => {
    const row = { id: 2, email: 'b@x.com', name: 'B', created_at: new Date() };
    const repo = new UsersRepository(mockDb(row) as never);
    await expect(repo.create({ email: 'b@x.com', name: 'B' })).resolves.toEqual(row);
  });

  it('findUnsent returns users with welcome_email_sent false ordered by id', async () => {
    const rows = [
      { id: 1, email: 'a@x.com', name: null, welcome_email_sent: false, created_at: new Date() },
    ];
    const calls: string[][] = [];
    const execute = () => Promise.resolve(rows);
    const orderByFn = (...args: unknown[]) => {
      calls.push(['orderBy', ...args.map(String)]);
      return { execute };
    };
    const whereFn = (...args: unknown[]) => {
      calls.push(['where', ...args.map(String)]);
      return { orderBy: orderByFn };
    };
    const db = {
      selectFrom: () => ({ selectAll: () => ({ where: whereFn }) }),
    };
    const repo = new UsersRepository(db as never);
    await expect(repo.findUnsent()).resolves.toEqual(rows);
    expect(calls).toEqual([
      ['where', 'welcome_email_sent', '=', 'false'],
      ['orderBy', 'id'],
    ]);
  });

  it('markWelcomeEmailSent flips the flag for the id', async () => {
    const state = { table: '', set: {} as unknown, where: [] as unknown[] };
    const db = {
      updateTable: (table: string) => {
        state.table = table;
        return {
          set: (values: unknown) => {
            state.set = values;
            return {
              where: (...args: unknown[]) => {
                state.where = args;
                return { executeTakeFirst: () => Promise.resolve({ numUpdatedRows: 1n }) };
              },
            };
          },
        };
      },
    };
    const repo = new UsersRepository(db as never);
    await repo.markWelcomeEmailSent(7);
    expect(state.table).toBe('users');
    expect(state.set).toEqual({ welcome_email_sent: true });
    expect(state.where).toEqual(['id', '=', 7]);
  });
});
