import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import {
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets/decorators';
import * as crypto from 'crypto';
import { Namespace, Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { ChatService } from './chat.service';
import { User } from 'src/users/entities/user.entity';
import { ChatRoom } from 'src/chat-rooms/entities/chat-room.entity';
import { RoomAccess } from 'src/chat-room-accesses/entities/room-access.entity';
import { Message } from './entities/message.entity';
import { ChatEvent, EventType } from 'src/chat-events/entities/message.entity';
import { ChatEventsService } from 'src/chat-events/chat-events.service';

// import {
//   ClientToServerEvents,
//   ServerToClientEvents,
//   InterServerEvents,
//   SocketData,
// } from '../socket-io-adapter';

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  message: (payload: OutgoingMessage) => void;
  error: (error: Error) => void;
  // newConnection: (payload?: string) => void;
  hello: (payload: string) => void;
  joinRoom: (payload: { userId: number; roomId: string | string[] }) => void;
  invite: (payload: { roomId: string }) => void;
  banish: (payload: { roomId: string }) => void;
  leaveRoom: (payload: { userId: number; roomId: string }) => void;
  users: (users: Array<string>) => void;
  // userConnected: (user: { userID: string; username?: string }) => void;
  // userDisconnected: (user: { userID: string; username?: string }) => void;
  userConnected: (userID: string) => void;
  userDisconnected: (userID: string) => void;
  pong: (timeRecord: { userId: number; time: string; chat: number }) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

interface IncomingMessageFile {
  file: string;
  filename: string;
}

interface BaseIncomingMessage {
  text: string;
  roomId: string;
}

interface TextIM extends BaseIncomingMessage {
  type?: 'text';
}

interface ImagesIM extends BaseIncomingMessage {
  file: IncomingMessageFile;
  type: 'image';
}

interface VideoIM extends BaseIncomingMessage {
  file: IncomingMessageFile;
  type: 'video';
}

interface AudoiIM extends BaseIncomingMessage {
  file: IncomingMessageFile;
  type: 'audio';
}

export type IncomingMessage = TextIM | ImagesIM;

interface BaseOutgoingMessage {
  message: string;
  createdAt: string;
  roomId: string;
}

type ServiceOM = BaseOutgoingMessage;
interface TextOutgoingMessage extends BaseOutgoingMessage {
  userId: string;
  nickname: string;
  profilePic: string;
}

interface ImagesOM extends BaseOutgoingMessage {
  file: string;
}

export type OutgoingMessage = TextOutgoingMessage | ImagesOM | ServiceOM;

interface AppServer<
  CtoS = ClientToServerEvents,
  StoC = ServerToClientEvents,
  StoS = InterServerEvents,
  Data = SocketData,
> extends Server<CtoS, StoC, StoS, Data> {
  username?: string;
}

export interface AppNamespace<
  CtoS = ClientToServerEvents,
  StoC = ServerToClientEvents,
  StoS = InterServerEvents,
  Data = SocketData,
> extends Namespace<CtoS, StoC, StoS, Data> {}

interface AppSocket<
  CtoS = ClientToServerEvents,
  StoC = ServerToClientEvents,
  StoS = InterServerEvents,
  Data = SocketData,
> extends Socket<CtoS, StoC, StoS, Data> {
  nickname: string;
  sessionID: string;
  userID: string;
}

@WebSocketGateway({
  namespace: 'chat',
})
@Injectable()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatRoomsService: ChatRoomsService,
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly chatEventsService: ChatEventsService,
  ) {}

  @WebSocketServer() io: AppNamespace;
  private usersOnline: Set<string> = new Set();

  private randomId() {
    // console.warn('randomId');
    return crypto.randomBytes(8).toString('hex');
  }

  private personalRoom(socket: AppSocket) {
    return socket.id;
  }

  private async joinAllEligibleRooms(client: AppSocket) {
    try {
      const userId = parseInt(client.userID);
      const roomIds: string[] =
        await this.chatRoomsService.getMyActiveRooms(userId);

      client.join(roomIds);
      //join private room
      client.join(this.personalRoom(client));
      console.log(client.rooms);
      console.log({ rooms: roomIds, userId });

      this.io
        .to(roomIds)
        .emit<'joinRoom'>('joinRoom', { userId, roomId: roomIds });
    } catch (e) {
      console.log(e);
    }
  }

  private connectUserToRoom(userId: number, roomId: string) {
    for (const [, socket] of this.io.sockets) {
      console.log((socket as AppSocket).userID);
      if (parseInt((socket as AppSocket).userID) === userId) {
        socket.join(roomId);
        this.io
          .to(this.personalRoom(socket as AppSocket))
          .emit<'invite'>('invite', { roomId: roomId });
        console.log(socket.rooms);
        break;
      }
    }
  }

  private disconnectUserFromRoom(userId: number, roomId: string) {
    for (const [, socket] of this.io.sockets) {
      console.log((socket as AppSocket).userID);
      if (parseInt((socket as AppSocket).userID) === userId) {
        socket.leave(roomId);
        this.io
          .to(this.personalRoom(socket as AppSocket))
          .emit<'banish'>('banish', { roomId: roomId });
        console.log({ rooms: socket.rooms });
        break;
      }
    }
  }

  private async onInit(socket: AppSocket) {
    try {
      // const sessionID = socket.handshake.auth.sessionID;
      // if (sessionID) {
      //   const session = sessionStore.findSession(sessionID);
      //   if (session) {
      //     socket.sessionID = sessionID;
      //     socket.userID = session.userID;
      //     socket.username = session.username;
      //     return;
      //   }
      // }
      // const token = socket.handshake.auth.token;
      const token = socket.handshake.headers['authorization'] as string;
      console.log(token);

      if (!token) {
        throw new Error('invalid username');
      }

      const user = await this.usersService.getUserByToken(token);
      // socket.sessionID = this.randomId();
      socket.userID = user.id;
      socket.nickname = user.nickname;
      this.usersOnline.add(user.id);
      console.log(this.usersOnline);
      // const users: Set<string> = new Set();
      // this.io.sockets.forEach((socket: AppSocket) => {
      //   users.add(
      //     socket.userID,
      //     // username: userID,
      //   );
      // });

      // for (const [id, socket] of this.io.sockets) {
      //   // console.log(socket);
      //   users.push({
      //     userID: socket.userID,
      //     // username: userID,
      //   });
      // }
      // console.log('users', users);
      console.log(socket.userID, socket.rooms);
      socket.emit('users', Array.from(this.usersOnline));

      // socket.broadcast.emit('userConnected', socket.userID);
    } catch (e) {
      console.log(e);
      socket.emit('error', e.message);
      socket.disconnect();
    }

    // socket.appUserId = user.id;
  }

  afterInit() {
    console.log('initialized');
  }

  // io.on("connection", (socket) => {
  //   const users = [];
  //   for (let [id, socket] of io.of("/").sockets) {
  //     users.push({
  //       userID: id,
  //       username: socket.username,
  //     });
  //   }
  //   socket.emit("users", users);
  //   // ...
  // });

  async handleConnection(client: AppSocket) {
    // const sockets = this.io.sockets;
    console.log('c');
    // console.log(sockets.size);

    // console.log({ userId });
    // console.log('token', token);
    // client.emit('newConnection', 'all except');
    await this.onInit(client);
    await this.joinAllEligibleRooms(client);
    this.io.to(Array.from(client.rooms)).emit('userConnected', client.userID);
    // const users = [];
  }

  handleDisconnect(client: AppSocket) {
    // const sockets = this.io.sockets;
    console.log('dc');

    // const matchingSockets = await this.io.fetchSockets();
    // const isDisconnected = matchingSockets.size === 0;
    // if (isDisconnected) {
    // notify other users
    console.log(client.userID, client.rooms);

    this.io
      // .to(Array.from(client.rooms))
      .emit('userDisconnected', client.userID);
    this.usersOnline.delete(client.userID);
    console.log(this.usersOnline);

    // }
    // console.log(sockets.size);

    // this.users.forEach((user) => {
    //   if (user.self) {
    //     user.connected = false;
    //   }
    // });
  }

  // @SubscribeMessage('*')
  // handleAnything(client: AppSocket, args: any[]) {
  //   console.log('wildcard event');
  // }

  @SubscribeMessage('hello')
  helloWorld(client: AppSocket, args: any[]): void {
    console.log(args);
    this.io.emit('hello', 'hello world');

    const token = client.handshake.headers['authorization'] as string;
    console.log(token);
    console.log(client.id);

    console.log({ userID: client.userID });
  }

  @SubscribeMessage('createRoom')
  async createRoom(client: AppSocket, body: { userIds: number[] }) {
    const { userIds } = body;
    console.log(userIds);
    const userId = parseInt(client.userID);
    const user = await User.findOne({ where: { id: userId } });
    const room = await ChatRoom.create({
      name: `Чат ${user.nickname}`,
      userId: userId,
    });
    const messageToEmit = await this.chatEventsService.handleNewChatEvent({
      roomId: room.id,
      type: 'created',
      nickname: 'service',
    });

    await RoomAccess.bulkCreate([
      { roomId: room.id, userId: userId },
      ...userIds.map((id) => ({ roomId: room.id, userId: id })),
    ]);

    await Promise.all(
      userIds.map((item) => this.connectUserToRoom(item, room.id.toString())),
    );

    this.io.to(room.id.toString()).emit<'message'>('message', messageToEmit);

    Promise.all(
      userIds.map(async (item) =>
        this.chatEventsService.handleNewChatEvent({
          roomId: room.id,
          userId: item,
          type: 'invited',
          nickname: (await this.usersService.getOneUser(item)).nickname,
        }),
      ),
    ).then((messages) =>
      messages.map((messageToEmit) =>
        this.io
          .to(room.id.toString())
          .emit<'message'>('message', messageToEmit),
      ),
    );

    // console.log(room);

    return room;
  }

  @SubscribeMessage('deleteRoom')
  async deleteChatRoom(socket: AppSocket, body: { roomId: number }) {
    const { roomId } = body;
    const userId = socket.userID;

    const room = await ChatRoom.findOne({ where: { id: roomId, userId } });

    if (!room) {
      throw new Error('Вы не являетесь администратором чата');
    }

    this.chatEventsService
      .handleNewChatEvent({
        roomId: room.id,
        type: 'deleted',
        nickname: 'service',
      })
      .then((messageToEmit) =>
        this.io
          .to(room.id.toString())
          .emit<'message'>('message', messageToEmit),
      );

    await RoomAccess.update({ active: false }, { where: { roomId: room.id } });

    // let newAccessType = 'active';

    this.io.socketsLeave(room.id.toString());
    console.log(socket.rooms);

    await room.update({ userId: null });

    // return { status: StatusCodes.NO_CONTENT, text: ReasonPhrases.NO_CONTENT };
  }

  @SubscribeMessage('inviteOrBanish')
  async handleInvitation(
    client: AppSocket,
    body: { room: string; inviteeId: number },
  ): Promise<void> {
    try {
      const userId = parseInt(client.userID);
      // client.join(room);
      const { room, inviteeId } = body;
      console.log({ userId, room, inviteeId });

      const res = await this.chatRoomsService.updateChatRoomAccess({
        userId,
        roomId: +room,
        updateeId: inviteeId,
      });

      if (res.status) {
        this.connectUserToRoom(inviteeId, room);
        this.io.to(room).emit('message', res.message);
      } else {
        this.io.to(room).emit('message', res.message);
        this.disconnectUserFromRoom(inviteeId, room);
      }
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleRoomJoin(client: AppSocket, room: string): Promise<void> {
    try {
      const userId = parseInt(client.userID);
      client.join(room);

      const roomIds: string[] =
        // await this.chatRoomsService.getMyRoomsIds(userId);
        await this.chatRoomsService.getMyRoomsIds(userId);

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
      const deletedEvent = latestEvents.find(
        (event) => event.type === 'deleted',
      );

      if (!!evictedEvent && evictedEvent.id > invitedEvent.id) {
        throw new Error(
          'Вы не можете вступить в эту комнату, так как были удалены из нее',
        );
      }
      if (!!deletedEvent) {
        throw new Error('Эта комната была удалена администратором');
      }
      // console.log(client.rooms);
      await roomAccess.update({ active: true });
      client.join(room);
      const messageToEmit = await this.chatEventsService.handleNewChatEvent({
        roomId: parseInt(room),
        userId: userId,
        type: 'joined',
        nickname: (await this.usersService.getOneUser(userId)).nickname,
      });

      this.io.to(room).emit('message', messageToEmit);
      this.io.to(room).emit<'joinRoom'>('joinRoom', { userId, roomId: room });
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleRoomLeave(client: AppSocket, room: string) {
    const userId = parseInt(client.userID);

    const roomAccess = await RoomAccess.findOne({
      where: { roomId: room, userId: userId },
    });

    if (!roomAccess.active) {
      throw new Error('Вы не состоите в этой комнате');
    }

    await roomAccess.update({ active: false });
    const messageToEmit = await this.chatEventsService.handleNewChatEvent({
      roomId: parseInt(room),
      userId: userId,
      type: 'left',
      nickname: (await this.usersService.getOneUser(userId)).nickname,
    });

    this.io.to(room).emit('message', messageToEmit);
    this.io.to(room).emit('leaveRoom', { userId, roomId: room });
    client.leave(room);

    console.log(client.rooms);
  }

  @SubscribeMessage('ping')
  async handlePing(client: AppSocket, chat: string) {
    // console.log('ping!', chat);
    const timeRecord = await this.chatRoomsService.createTimeRecord(
      +client.userID,
      +chat,
    );
    client.broadcast.emit('pong', timeRecord);
  }

  @SubscribeMessage('message')
  async handleNewMessage(
    @ConnectedSocket() client: AppSocket,
    @MessageBody() message: IncomingMessage,
    // @MessageBody() file: any,
  ) {
    try {
      console.log(message);
      console.log(client.userID);
      const userId = parseInt(client.userID);
      console.log(userId);

      const payload = await this.chatService.handleNewMessage(userId, message);

      console.log(payload);
      this.io.to(message.roomId).emit('message', payload);
    } catch (e) {
      console.log(e);
    }
  }
}
