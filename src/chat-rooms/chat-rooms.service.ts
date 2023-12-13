import { HttpException, Injectable } from '@nestjs/common';

import { User } from '../users/entities/user.entity';

import { RoomAccess } from '../chat-room-accesses/entities/room-access.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { UpdateRoomData } from './chat-rooms.controller';
import { UsersService } from 'src/users/users.service';
import { deleteFile, uploadFiles } from 'src/utils/functions';
import { ChatEventsService } from 'src/chat-events/chat-events.service';
import { OutgoingMessage } from 'src/chat/chat.gateway';
import { ChatEvent } from 'src/chat-events/entities/message.entity';

@Injectable()
export class ChatRoomsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly chatEventsService: ChatEventsService,
  ) {}

  async getMyRoomsIds(userId: number): Promise<string[]> {
    try {
      const chats = await RoomAccess.findAll({
        where: { userId: userId },
        include: [
          {
            model: ChatRoom,
            attributes: ['id'],
            required: true,
          },
        ],
        attributes: [],
      });
      console.log(chats);

      return chats.map((item) => item.chat.id.toString());
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async test(userId: number, room: string) {
    try {
      // const userId = parseInt(client.userID);
      // client.join(room);

      const roomIds: string[] =
        // await this.chatRoomsService.getMyRoomsIds(userId);
        await this.getMyRoomsIds(userId);

      if (!roomIds.includes(room)) {
        throw new Error('Вы не можете вступить в эту комнату');
      }

      const roomAccess = await RoomAccess.findOne({
        where: { roomId: room, userId: userId },
        include: [
          {
            model: ChatRoom,
            attributes: ['id'],
            include: [
              {
                model: ChatEvent,
                attributes: ['id', 'userId', 'roomId', 'type'],
                order: [['id', 'DESC']],
                separate: true,
              },
            ],
          },
        ],
      });
      // console.log(roomAccess.active);
      if (roomAccess.active) {
        throw new Error('Вы уже состоите в этой комнате');
      }

      const latestEvents = roomAccess.chat.events as unknown as {
        id: number;
        userId?: number;
        roomId: number;
        type: string;
      }[];
      const evictedEvent = latestEvents.find(
        (event) => event.userId === userId && event.type === 'evicted',
      );
      const invitedEvent = latestEvents.find(
        (event) => event.userId === userId && event.type === 'invited',
      );

      if (!!evictedEvent && evictedEvent.id > invitedEvent.id) {
        throw new Error(
          'Вы не можете вступить в эту комнату, так как были удалены из нее',
        );
      }

      return roomAccess;

      // console.log(client.rooms);

      // this.io.to(room).emit<'joinRoom'>('joinRoom', { userId, roomId: room });
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, StatusCodes.BAD_GATEWAY);
    }
  }

  async getMyActiveRooms(userId: number) {
    try {
      const chats = await RoomAccess.findAll({
        where: { userId: userId, active: true },
        include: [
          {
            model: ChatRoom,
            attributes: ['id'],
            required: true,
            // include: [
            //   {
            //     model: ChatEvent,
            //     limit: 1,
            //     order: [['id', 'DESC']],
            //   },
            // ],
          },
        ],
        attributes: [],
      });

      return chats.map((item) => item.chat.id.toString());
      return chats;
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async getMyRooms(userId: number) {
    try {
      const chats = await RoomAccess.findAll({
        where: { userId: userId },
        include: [
          {
            model: ChatRoom,
            attributes: ['id', 'userId'],
            include: [
              {
                model: RoomAccess,
                attributes: ['id'],
                // where: { active: 'active' },
                include: [
                  {
                    model: User,
                    // where: { id: { [Op.ne]: userId } },
                    attributes: [
                      'id',
                      'firstName',
                      'lastName',
                      'nickname',
                      'profilePics',
                    ],
                  },
                ],
              },
            ],
          },
        ],
        attributes: ['id', 'active'],
      });

      const withAdminStatus = chats.map((access) => {
        return {
          ...access.toJSON(),
          chat: {
            ...access.chat.toJSON(),
            isAdmin: access.chat.userId === userId,
          },
        };
      });
      return withAdminStatus;
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async updateChatRoomAccess(body: {
    userId: number;
    roomId: number;
    updateeId: number;
  }): Promise<{ status: boolean; message: OutgoingMessage }> {
    const { userId, roomId, updateeId } = body;

    const isAdmin = await ChatRoom.findOne({ where: { id: roomId, userId } });

    if (!isAdmin) {
      throw new Error('Вы не являетесь администратором чата');
    }

    const access = await RoomAccess.findOne({
      where: { roomId: roomId, userId: updateeId },
    });

    let messageToEmit: OutgoingMessage;

    if (!access) {
      console.log('there wasnt any');
      await RoomAccess.create({ roomId: roomId, userId: updateeId });
      messageToEmit = await this.chatEventsService.handleNewChatEvent({
        roomId: roomId,
        userId: updateeId,
        type: 'invited',
        nickname: (await this.usersService.getOneUser(updateeId)).nickname,
      });

      return { status: true, message: messageToEmit };
    } else if (access.active) {
      console.log('there was');
      await access.update({ active: false });
      messageToEmit = await this.chatEventsService.handleNewChatEvent({
        roomId: roomId,
        userId: updateeId,
        type: 'evicted',
        nickname: (await this.usersService.getOneUser(updateeId)).nickname,
      });

      return { status: false, message: messageToEmit };
    } else {
      console.log('there was inactive');
      await access.update({ active: true });
      messageToEmit = await this.chatEventsService.handleNewChatEvent({
        roomId: roomId,
        userId: updateeId,
        type: 'invited',
        nickname: (await this.usersService.getOneUser(updateeId)).nickname,
      });
      return { status: true, message: messageToEmit };
    }
    // return { status: StatusCodes.CREATED, text: ReasonPhrases.CREATED };
  }

  async updateChatRoomData(
    token: string,
    body: UpdateRoomData,
    file: Express.Multer.File,
  ) {
    const { name, roomId } = body;

    const user = await this.usersService.getUserByToken(token);

    const room = await ChatRoom.findOne({
      where: { id: roomId, userId: user.id },
    });

    if (!room) {
      throw new Error('Вы не являетесь администратором чата');
    }

    let pic: string;
    if (file) {
      pic = (await uploadFiles(file, '/chat-rooms')) as string;
    }
    await deleteFile(room.pic, '/chat-rooms');

    await room.update({ name, pic });

    return { status: StatusCodes.CREATED, text: ReasonPhrases.CREATED };
  }

  async deleteChatRoom(body: { userId: number; roomId: number }) {
    const { userId, roomId } = body;

    const room = await ChatRoom.findOne({ where: { id: roomId, userId } });

    if (!room) {
      throw new Error('Вы не являетесь администратором чата');
    }

    // await RoomAccess.update(
    //   { type: 'deleted' },
    //   {
    //     where: { roomId: roomId },
    //   },
    // );

    // await this.chatEventsService.handleNewChatEvent({
    //   roomId: roomId,
    //   type: 'deleted',
    // });

    await room.update({ userId: null });

    return { status: StatusCodes.NO_CONTENT, text: ReasonPhrases.NO_CONTENT };
  }

  async createTimeRecord(userId: number, chat: number) {
    try {
      // console.log(user.id, chat);
      const record = await RoomAccess.findOne({
        where: { userId: userId, roomId: chat },
      });

      if (!record) {
        throw new Error('Вы не состоите в этой комнате');
      }

      record.changed('updatedAt', true);
      await record.update({
        updatedAt: new Date(),
      });
      return { userId: userId, time: record.updatedAt, chat: chat };
      // { updatedAt: sequelize.literal('CURRENT_TIMESTAMP') },
      // // console.log(updated);
    } catch (e) {
      console.log(e);
    }
  }
}
