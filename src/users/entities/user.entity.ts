import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { ChatEvent } from 'src/chat-events/entities/message.entity';
import { ChatRoom } from 'src/chat-rooms/entities/chat-room.entity';
import { Favourite } from 'src/favourites/entities/favourite.entity';

import { Transaction } from 'src/transactions/entities/transaction.entity';

const roles = ['user', 'admin'] as const;

type RoleType = (typeof roles)[number];

@Table
export class User extends Model<User> {
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  @ApiProperty()
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nickname: string;

  @Column({
    type: DataType.ENUM(...roles),
    allowNull: true,
    defaultValue: 'user',
  })
  @ApiProperty()
  role: RoleType;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  @ApiProperty()
  isBlocked: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  @ApiProperty()
  isDeleted: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty()
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty()
  lastName: string;

  @Column({
    type: DataType.STRING(1000),
    allowNull: true,
  })
  @ApiProperty()
  about: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty()
  phone: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  @ApiProperty()
  phoneHidden: boolean;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  @ApiProperty()
  profilePics: string[];

  @HasMany(() => Favourite)
  favourites: Favourite;

  @HasMany(() => Transaction)
  transactions: Transaction;

  @HasMany(() => ChatRoom)
  chatRooms: ChatRoom;

  @HasMany(() => ChatEvent)
  events: ChatEvent;
}
