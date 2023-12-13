import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { ChatRoomsModule } from '../chat-rooms/chat-rooms.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatEventsModule } from 'src/chat-events/chat-events.module';

@Module({
  imports: [ChatRoomsModule, UsersModule, ChatEventsModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
