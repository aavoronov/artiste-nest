import { Module } from '@nestjs/common';
import { EventCategoriesService } from './event-categories.service';
import { EventCategoriesController } from './event-categories.controller';

@Module({
  controllers: [EventCategoriesController],
  providers: [EventCategoriesService],
})
export class EventCategoriesModule {}
