import { Body, Controller, Post } from '@nestjs/common';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { JoinRequestsService } from './join-requests.service';

@Controller('join-requests')
export class JoinRequestsController {
  constructor(private readonly joinRequestsService: JoinRequestsService) {}

  @Post()
  createJoinRequest(@Body() createJoinRequestDto: CreateJoinRequestDto) {
    return this.joinRequestsService.createJoinRequest(createJoinRequestDto);
  }

  @Post('approve')
  acceptJoinRequest(@Body() body: { id: string; password?: string }) {
    return this.joinRequestsService.acceptJoinRequest(body);
  }
}
