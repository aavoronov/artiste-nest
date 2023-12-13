import { HttpException, Injectable } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';
import { RoomAccess } from '../chat-room-accesses/entities/room-access.entity';
import { User } from '../users/entities/user.entity';
import { Message } from './entities/message.entity';
import { uploadFiles } from 'src/utils/functions';
import { IncomingMessage, OutgoingMessage } from './chat.gateway';
import { ChatRoomsService } from 'src/chat-rooms/chat-rooms.service';
import { Op } from 'sequelize';

@Injectable()
export class ChatService {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  async handleNewMessage(
    userId: number,
    incomingMessage: IncomingMessage,
  ): Promise<OutgoingMessage> {
    try {
      // console.log(payload);

      const myRoomIds = await this.chatRoomsService.getMyRoomsIds(userId);

      if (!myRoomIds.includes(incomingMessage.roomId)) {
        throw new Error('Вы не состоите в этой комнате');
      }

      const user = await User.findOne({
        where: { id: userId },
        attributes: ['id'],
      });
      // // console.log(user.id);
      let dbFileName: string;

      if ('file' in incomingMessage && incomingMessage.file) {
        await uploadFiles(incomingMessage.file);
      }

      const newMessage = await Message.create({
        userId: user.id,
        message: incomingMessage.text,
        file: dbFileName,
        roomId: parseInt(incomingMessage.roomId),
        type: incomingMessage.type || 'text',
      });

      if (!newMessage) {
        throw new HttpException('Ошибка', StatusCodes.BAD_REQUEST, {
          cause: new Error('Some Error'),
        });
      }

      // console.log(file);
      const outgoingMessage: OutgoingMessage = {
        // email: message.email,
        message: incomingMessage.text,
        nickname: user.nickname,
        createdAt: newMessage.createdAt,
        profilePic:
          user.profilePics && user.profilePics.length
            ? user.profilePics[0]
            : null,
        file: dbFileName,
        roomId: incomingMessage.roomId,
        userId: user.id,
      };

      return outgoingMessage;

      // console.log('ok');
    } catch (e) {
      // console.log(e);
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  private async getMessagesPerRoom(
    room: number,
    userId: number,
    limit: number,
    offset: number,
  ) {
    const everyonesLastVisits = (
      await RoomAccess.findAll({
        where: { roomId: room },
        attributes: ['updatedAt'],
      })
    ).map((item) => item.updatedAt);

    console.log(everyonesLastVisits);
    const perRoom = await Message.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'nickname'],
        },
      ],
      where: { roomId: room },
      attributes: ['id', 'message', 'file', 'roomId', 'createdAt'],
      order: [['id', 'DESC']],
      limit,
      offset,
    });

    const plainPerRoom = perRoom.map((x) => x.get({ plain: true }));

    const perRoomWithDeliveryStatus = plainPerRoom.map((message) => {
      const delivered: boolean = everyonesLastVisits.every((time) => {
        return time > message.createdAt;
      });
      return { ...message, delivered };
    });
    return perRoomWithDeliveryStatus;
  }

  private async periodsToGetDataClause(userId: number) {
    // [[since, through]]
    return userId;
  }

  //   async getMessages(body: IGetMessages): Promise<IRequestMessage> {
  async getMessages(userId: number) {
    const limit = 20;
    const page = 1;
    const offset = page * limit - limit;

    try {
      const access = await RoomAccess.findAll({
        include: [{ model: User, where: { id: userId }, attributes: ['id'] }],
      });

      const rooms = access.map((item) => item.roomId);

      // console.log(rooms);

      // const results = await async.map(rooms, getMessagesPerRoom);
      const results = await Promise.all(
        rooms.map((room) =>
          this.getMessagesPerRoom(room, userId, limit, offset),
        ),
      );

      const msgs = results.flat().sort((a, b) => {
        const idA = a.id;
        const idB = b.id;
        if (idA < idB) {
          return -1;
        }
        if (idA > idB) {
          return 1;
        }
        return 0;
      });

      return msgs;
    } catch (e) {
      return { status: StatusCodes.BAD_REQUEST, message: 'Ошибка', data: e };
      // // console.log(e);
    }
  }

  async getMoreMessages(userId: number, page: number, chat: string) {
    const limit = 20;
    //   const page = parseInt(body.page) || 1;
    const offset = page * limit - limit;

    const access = await RoomAccess.findAll({
      include: [{ model: User, where: { id: userId }, attributes: ['id'] }],
    });

    const rooms = access.map((item) => item.roomId);

    // console.log(rooms);

    if (!rooms.includes(parseInt(chat))) {
      throw new HttpException(
        'Вы не зарегистрированы в этом чате',
        StatusCodes.FORBIDDEN,
        {
          cause: new Error('Some Error'),
        },
      );
    }

    const results = await this.getMessagesPerRoom(
      parseInt(chat),
      userId,
      limit,
      offset,
    );

    const msgs = results.flat().sort((a, b) => {
      const idA = a.id;
      const idB = b.id;
      if (idA < idB) {
        return -1;
      }
      if (idA > idB) {
        return 1;
      }
      return 0;
    });

    return msgs;
  }

  async getMedia(userId: number, page: number, chat: string) {
    const limit = 40;
    //   const page = parseInt(body.page) || 1;
    const offset = page * limit - limit;

    const access = await RoomAccess.findAll({
      include: [{ model: User, where: { id: userId }, attributes: ['id'] }],
    });

    const rooms = access.map((item) => item.roomId);

    // console.log(rooms);

    if (!rooms.includes(parseInt(chat))) {
      throw new HttpException(
        'Вы не зарегистрированы в этом чате',
        StatusCodes.FORBIDDEN,
        {
          cause: new Error('Some Error'),
        },
      );
    }

    const results = await Message.findAll({
      where: { roomId: chat, type: { [Op.ne]: 'text' } },
      attributes: ['type', 'file'],
      order: [['id', 'DESC']],
      limit: limit,
      offset: offset,
    });

    return results;
  }

  // async getUserFromSocket(socket: Socket) {
  //   let token = socket.handshake.headers.authorization;

  //   const user = this.usersService.getUserFromAuthenticationToken(token);

  //   if (!user) {
  //     throw new WsException('Invalid credentials.');
  //   }
  //   return user;
  // }
}
