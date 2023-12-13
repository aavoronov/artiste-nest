import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AffirmationsModule } from './affirmations/affirmations.module';
import { GenericDataModule } from './generic-data/generic-data.module';
import { TasksModule } from './tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { JoinRequestsModule } from './join-requests/join-requests.module';
import { AuthMiddleware } from './utils/middleware/auth.middleware';
import { EventCategoriesModule } from './event-categories/event-categories.module';
import { EventsModule } from './events/events.module';
import { FavouritesModule } from './favourites/favourites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatRoomsModule } from './chat-rooms/chat-rooms.module';
import { ChatModule } from './chat/chat.module';
import { TransactionsModule } from './transactions/transactions.module';
import { MailerModule } from './mailer/mailer.module';
import { ChatEventsModule } from './chat-events/chat-events.module';

const modules = [
  DatabaseModule,
  MailerModule,
  AffirmationsModule,
  GenericDataModule,
  TasksModule,
  UsersModule,
  JoinRequestsModule,
  EventCategoriesModule,
  EventsModule,
  FavouritesModule,
  ChatModule,
  ChatRoomsModule,
  NotificationsModule,
  ChatRoomsModule,
  TransactionsModule,
];

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), ...modules, ChatEventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      '/users/reauth',
      '/users/password',
      '/users/forgot-password',
      '/users/all',
      { path: '/users/:id', method: RequestMethod.GET },
      '/favourites',
      '/event-categories',
      '/events',
      '/notifications',
      '/chat-rooms',
      '/chat',
      '/transactions',

      // '/purchases/',
      // { path: '/reviews/', method: RequestMethod.POST },
      // { path: '/products/', method: RequestMethod.POST },
      // { path: '/products/:id', method: RequestMethod.PATCH },
      // { path: '/products/my', method: RequestMethod.GET },
      // { path: '/chat-rooms/', method: RequestMethod.ALL },
      // '/chat/more',
      // // '/products/:id',
      // { path: '/users/', method: RequestMethod.PATCH },

      '/generic-data/',
    );
  }
}
