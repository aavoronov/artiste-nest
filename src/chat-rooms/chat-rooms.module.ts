import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { ChatRoomsController } from './chat-rooms.controller';
import { ChatRoomsService } from './chat-rooms.service';
import { ChatEventsModule } from 'src/chat-events/chat-events.module';

@Module({
  controllers: [ChatRoomsController],
  providers: [ChatRoomsService],
  exports: [ChatRoomsService],
  imports: [UsersModule, ChatEventsModule],
})
export class ChatRoomsModule {}
