import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { Op } from 'sequelize';
import { Event } from 'src/events/entities/event.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class NotificationsService {
  async createNotification(createNotificationDto: CreateNotificationDto) {
    const { inviteeId, userId, eventId } = createNotificationDto;

    if (inviteeId === userId) {
      throw new Error('Нельзя пригласить себя же');
    }

    const event = await Event.findOne({ where: { id: eventId } });
    const user = await User.findOne({ where: { id: userId } });

    const notificationText = `${user.firstName} ${user.lastName} пригласил(а) Вас на выставку ${event.name} в ${event.location}`;

    await Notification.create({ userId: inviteeId, text: notificationText });
    console.log(createNotificationDto);
    return 'This action adds a new notification';
  }

  async getMyNotifications(userId: number) {
    const notifications = await Notification.findAll({
      where: { [Op.or]: [{ userId: userId }, { userId: { [Op.eq]: null } }] },
      order: [['id', 'DESC']],
      // where:  { userId: {[Op.or]: userId }userId, userId: { [Op.eq]: null } } ,
    });
    return notifications;
  }
}
