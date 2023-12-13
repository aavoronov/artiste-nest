import { Body, Controller, Get } from '@nestjs/common';
import { Query } from '@nestjs/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getMessages(@Body() body: { userId: number }) {
    return this.chatService.getMessages(body.userId);
  }

  @Get('more')
  getMoreMessages(
    @Body() body: { userId: number },
    @Query('page') page: number,
    @Query('chat') chat: string,
  ) {
    return this.chatService.getMoreMessages(body.userId, page, chat);
  }

  @Get('media')
  getMedia(
    @Body() body: { userId: number },
    @Query('page') page: number,
    @Query('chat') chat: string,
  ) {
    return this.chatService.getMedia(body.userId, page, chat);
  }
}
