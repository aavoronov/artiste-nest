import { Injectable } from '@nestjs/common';
import { EventCategory } from './entities/event-category.entity';

@Injectable()
export class EventCategoriesService {
  async getAllCategories() {
    const categories = await EventCategory.findAll({
      attributes: ['id', 'name', 'pic'],
    });
    return categories;
  }

  async getOneCategory(id: number) {
    const category = await EventCategory.findOne({
      where: { id },
      attributes: ['id', 'name', 'pic'],
    });
    return category;
  }
}
