import { UsersController } from './users.controller.js';

describe('UsersController', () => {
  it('create delegates to the service and returns the row', async () => {
    const row = { id: 1, email: 'a@x.com', name: null, created_at: new Date() };
    const service = { create: () => Promise.resolve(row) };
    const controller = new UsersController(service as never);
    await expect(
      controller.create({ email: 'a@x.com', name: null }),
    ).resolves.toEqual(row);
  });

  it('findOne delegates to the service and returns the row', async () => {
    const row = { id: 1, email: 'a@x.com', name: null, created_at: new Date() };
    const service = { findByIdOrFail: () => Promise.resolve(row) };
    const controller = new UsersController(service as never);
    await expect(controller.findOne(1)).resolves.toEqual(row);
  });
});
