import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getAllEvents(@Query() queries: Record<string, string>) {
    return this.eventsService.getAllEvents(queries);
  }

  @Get(':id')
  getOneEvent(@Param('id') id: string) {
    return this.eventsService.getOneEvent(+id);
  }
}
