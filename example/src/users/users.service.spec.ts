import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  it('create delegates to the repository and returns the row', async () => {
    const row = { id: 1, email: 'a@x.com', name: null, created_at: new Date() };
    const repo = { create: () => Promise.resolve(row) };
    const service = new UsersService(repo as never);
    await expect(
      service.create({ email: 'a@x.com', name: null }),
    ).resolves.toEqual(row);
  });

  it('findByIdOrFail returns the row when found', async () => {
    const row = { id: 1, email: 'a@x.com', name: null, created_at: new Date() };
    const repo = { findById: () => Promise.resolve(row) };
    const service = new UsersService(repo as never);
    await expect(service.findByIdOrFail(1)).resolves.toEqual(row);
  });

  it('findByIdOrFail throws NotFoundException when missing', async () => {
    const repo = { findById: () => Promise.resolve(undefined) };
    const service = new UsersService(repo as never);
    await expect(service.findByIdOrFail(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
