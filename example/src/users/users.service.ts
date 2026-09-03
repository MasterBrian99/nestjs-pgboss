import { Injectable, NotFoundException } from '@nestjs/common';
import type { Selectable } from 'kysely';
import type { UsersTable } from '../database/database.types.js';
import { UsersRepository } from './users.repository.js';

export interface CreateUserInput {
  email: string;
  name?: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  create(input: CreateUserInput): Promise<Selectable<UsersTable>> {
    return this.users.create(input);
  }

  async findByIdOrFail(id: number): Promise<Selectable<UsersTable>> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }
}
