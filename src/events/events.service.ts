import { Injectable } from '@nestjs/common';
import { Event } from './entities/event.entity';
import { EventCategory } from 'src/event-categories/entities/event-category.entity';
import { getWhereClause } from 'src/utils/functions';

import { User } from 'src/users/entities/user.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Injectable()
export class EventsService {
  async getAllEvents(queries: Record<string, string>) {
    const { whereClause } = getWhereClause({ queries, searchFields: 'name' });
    const events = await Event.findAll({
      attributes: [
        'name',
        'pics',
        'phone',
        'website',
        'location',
        'description',
        'isInternal',
      ],
      include: [{ model: EventCategory, attributes: ['name'] }],
      where: whereClause,
      order: [['id', 'DESC']],
    });
    return events;
  }

  async getOneEvent(id: number) {
    const event = await Event.findOne({
      where: { id },
      include: [
        { model: EventCategory, attributes: ['name'] },
        // {
        //   model: Transaction,
        //   attributes: ['id'],
        //   include: [{ model: User, attributes: ['id', 'profilePics'] }],
        // },
      ],
    });
    const users = await User.findAll({
      include: [
        { model: Transaction, attributes: ['id'], where: { eventId: id } },
      ],
    });
    return { event, users };
  }
}
