import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../constants';
import { databaseConfig } from './database.config';
import { Affirmation } from 'src/affirmations/entities/affirmation.entity';
import { GenericData } from 'src/generic-data/entities/generic-data.entity';
import { JoinRequest } from 'src/join-requests/entities/join-request.entity';
import { User } from 'src/users/entities/user.entity';
import { EventCategory } from 'src/event-categories/entities/event-category.entity';
import { Event } from 'src/events/entities/event.entity';
import { Favourite } from 'src/favourites/entities/favourite.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { ChatRoom } from 'src/chat-rooms/entities/chat-room.entity';
import { RoomAccess } from 'src/chat-room-accesses/entities/room-access.entity';
import { Message } from 'src/chat/entities/message.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { ChatEvent } from 'src/chat-events/entities/message.entity';

const entities = [
  Affirmation,
  GenericData,
  JoinRequest,
  User,
  Event,
  EventCategory,
  Favourite,
  Notification,
  ChatRoom,
  RoomAccess,
  Message,
  ChatEvent,
  Transaction,
];
export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;
          break;
        default:
          config = databaseConfig.development;
      }
      const sequelize = new Sequelize(config);
      sequelize.addModels(entities);
      await sequelize.sync();
      // await sequelize.sync({ force: true });
      return sequelize;
    },
  },
];
