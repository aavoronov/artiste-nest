import {
  Column,
  BelongsTo,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { ChatRoom } from '../../chat-rooms/entities/chat-room.entity';
import { DataTypes } from 'sequelize';

// const accessTypes = ['active', 'evicted', 'left', 'deleted'] as const;

@Table
export class RoomAccess extends Model<RoomAccess> {
  // @Column({
  //   type: DataTypes.ENUM(...accessTypes),
  //   defaultValue: 'active',
  // })
  // type: (typeof accessTypes)[number];

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  })
  active: boolean;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => ChatRoom)
  chat: ChatRoom;

  @ForeignKey(() => ChatRoom)
  roomId: number;
}
