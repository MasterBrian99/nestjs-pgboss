import * as m001 from './migrations/001_create_users_table.js';

describe('migrations', () => {
  it('001_create_users_table exports up and down', () => {
    expect(typeof m001.up).toBe('function');
    expect(typeof m001.down).toBe('function');
  });
});
