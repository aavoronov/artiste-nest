import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
import { User } from '../../users/entities/user.entity';

const eventTypes = [
  'created',
  'invited',
  'left',
  'evicted',
  'joined',
  'deleted',
] as const;

export type EventType = (typeof eventTypes)[number];

@Table
export class ChatEvent extends Model<ChatEvent> {
  @Column({
    type: DataType.ENUM(...eventTypes),
    allowNull: false,
  })
  type: EventType;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => ChatRoom)
  room: ChatRoom;

  @ForeignKey(() => ChatRoom)
  roomId: number;
}
