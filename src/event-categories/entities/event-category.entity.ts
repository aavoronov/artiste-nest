import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { Event } from 'src/events/entities/event.entity';

@Table
export class EventCategory extends Model<EventCategory> {
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  @ApiProperty()
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  pic: string;

  @HasMany(() => Event)
  events: Event;
}
