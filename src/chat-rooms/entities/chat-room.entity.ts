import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  HasMany,
  Model,
  Table,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { RoomAccess } from '../../chat-room-accesses/entities/room-access.entity';
import { Message } from '../../chat/entities/message.entity';
import { User } from 'src/users/entities/user.entity';
import { ChatEvent } from 'src/chat-events/entities/message.entity';

@Table
export class ChatRoom extends Model<ChatRoom> {
  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pic: string;

  @HasMany(() => Message)
  messages: Message;

  @HasMany(() => RoomAccess)
  accesses: RoomAccess;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @HasMany(() => ChatEvent)
  events: ChatEvent;
}
