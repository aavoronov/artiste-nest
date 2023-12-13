import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
} from 'sequelize-typescript';
import { Event } from 'src/events/entities/event.entity';
import { User } from 'src/users/entities/user.entity';

@Table
export class Transaction extends Model<Transaction> {
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  @ApiProperty()
  sum: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  @ApiProperty()
  ticketsAmount: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => Event)
  event: Event;

  @ForeignKey(() => Event)
  eventId: number;
}
