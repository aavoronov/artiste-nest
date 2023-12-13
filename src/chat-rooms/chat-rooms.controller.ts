import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ChatRoomsService } from './chat-rooms.service';

export interface UpdateRoomData {
  name?: string;
  roomId: number;
}

@ApiTags('chat-rooms')
@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  @Get()
  getMyRooms(@Body() body: { userId: number }) {
    return this.chatRoomsService.getMyRooms(body.userId);
  }

  @Get('active')
  getMyActiveRooms(@Body() body: { userId: number }) {
    return this.chatRoomsService.getMyActiveRooms(body.userId);
  }

  @Get('test')
  test(@Body() body: { userId: number; room: string }) {
    return this.chatRoomsService.test(body.userId, body.room);
  }

  // @Patch('access')
  // updateChatRoomAccess(
  //   @Body() body: { userId: number; roomId: number; updateeId: number },
  // ) {
  //   return this.chatRoomsService.updateChatRoomAccess(body);
  // }

  @Patch()
  @UseInterceptors(FileInterceptor('pic'))
  updateChatRoomData(
    @Headers('Authorization') token: string,
    @Body() body: UpdateRoomData,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.chatRoomsService.updateChatRoomData(token, body, file);
  }
}
