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

const messageTypes = ['text', 'image', 'service'] as const;

@Table
export class Message extends Model<Message> {
  @Column({
    type: DataType.STRING(1500),
    allowNull: false,
  })
  message: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: (typeof messageTypes)[number];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  file: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => ChatRoom)
  room: ChatRoom;

  @ForeignKey(() => ChatRoom)
  roomId: number;
}
