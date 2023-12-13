import { Controller, Get, Param } from '@nestjs/common';
import { EventCategoriesService } from './event-categories.service';

@Controller('event-categories')
export class EventCategoriesController {
  constructor(
    private readonly eventCategoriesService: EventCategoriesService,
  ) {}

  @Get()
  getAllCategories() {
    return this.eventCategoriesService.getAllCategories();
  }

  @Get(':id')
  getOneCategory(@Param('id') id: string) {
    return this.eventCategoriesService.getOneCategory(+id);
  }
}
