import { Injectable } from '@nestjs/common';
import { Message } from 'src/chat/entities/message.entity';
import { ChatEvent, EventType } from './entities/message.entity';
import { OutgoingMessage } from 'src/chat/chat.gateway';

interface IChatEvent {
  userId?: number;
  roomId: number;
  type: EventType;
  nickname: string;
}

const serviceMessages = {
  created: () => 'Чат создан',
  invited: (nickname: string) => `${nickname} приглашен(-а) в чат`,
  left: (nickname: string) => `${nickname} покинул(-а) чат`,
  evicted: (nickname: string) => `${nickname} удален(-а) из чата`,
  joined: (nickname: string) => `${nickname} присоединился(-лась) к чату`,
  deleted: () => 'Чат удален',
};

@Injectable()
export class ChatEventsService {
  async handleNewChatEvent(event: IChatEvent): Promise<OutgoingMessage> {
    console.log(event);
    const { userId, roomId, type, nickname } = event;

    const newEvent = await ChatEvent.create(event);

    const message = await Message.create({
      userId,
      roomId,
      type: 'service',
      message: serviceMessages[type](nickname),
      // eventId: newEvent.id,
    });

    // nsp.to(roomId.toString()).emit<'message'>('message', {
    //   ...message,
    //   roomId: message.roomId.toString(),
    // } as OutgoingMessage);
    return {
      ...message,
      roomId: message.roomId.toString(),
    } as OutgoingMessage;
  }
}
