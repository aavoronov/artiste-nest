import { Injectable, Logger } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';

import { Affirmation } from 'src/affirmations/entities/affirmation.entity';
import { ChatRoom } from 'src/chat-rooms/entities/chat-room.entity';
// import { User } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  // @Interval(10000)
  // handleInterval() {
  //   this.logger.debug('Called every 10 seconds');
  // }

  // @Timeout(5000)
  // handleTimeout1() {
  //   this.logger.debug('Called once after 5 seconds');
  // }

  @Timeout(30 * 1000)
  async handleTimeout() {
    this.logger.debug('admin creation not implemented');
    // const admin = await User.findOne({
    //   where: { login: 'admin@example.com', role: 'admin' },
    // });

    // this.logger.debug(!!admin && 'admin exists');

    // if (!admin) {
    //   await User.create({
    //     login: 'admin@example.com',
    //     password:
    //       '$2b$10$wYFl4Y1lSzc2SHmsaKN9k.NdXhL8xgGXJFjWN5B4vJNvUHenF7iCW',
    //     role: 'admin',
    //     name: 'admin',
    //     inviteToken: nanoid(20),
    //   });
    //   this.logger.debug(!!admin && 'admin created');
    // }
  }
  // @Cron('* * 0 * * *', {
  //   timeZone: 'Europe/Moscow',
  // })
  @Timeout(10 * 1000)
  async pickTodaysAffirmation() {
    const prevId = await Affirmation.findOne({ where: { isToday: true } });

    const affirmationIds = (await Affirmation.findAll())
      .map((item) => item.id)
      .filter((item) => item !== prevId);

    const todaysId =
      affirmationIds[Math.floor(Math.random() * affirmationIds.length)];

    await Affirmation.update({ isToday: false }, { where: { isToday: true } });

    await Affirmation.update({ isToday: true }, { where: { id: todaysId } });

    console.log(todaysId);
    this.logger.debug(`Today's affirmation updated: id ${todaysId}`);
  }

  @Timeout(10 * 1000)
  async createCommonChat() {
    const chat = await ChatRoom.findOne({ where: { name: 'Artiste club' } });

    if (!!chat) return;

    await ChatRoom.create({ name: 'Artiste club' });
  }
}
