import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { EmailService } from './email.service.js';
import { WelcomeEmailProcessor } from './welcome-email.processor.js';

@Module({
  imports: [UsersModule],
  providers: [EmailService, WelcomeEmailProcessor],
})
export class EmailModule {}
