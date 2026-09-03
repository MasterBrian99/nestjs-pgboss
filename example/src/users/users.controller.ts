import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import type { Selectable } from 'kysely';
import type { UsersTable } from '../database/database.types.js';
import { UsersService, type CreateUserInput } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() input: CreateUserInput): Promise<Selectable<UsersTable>> {
    return this.users.create(input);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Selectable<UsersTable>> {
    return this.users.findByIdOrFail(id);
  }
}
