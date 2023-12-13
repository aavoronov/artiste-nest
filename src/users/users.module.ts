import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [MailerModule],
  exports: [UsersService],
})
export class UsersModule {}
