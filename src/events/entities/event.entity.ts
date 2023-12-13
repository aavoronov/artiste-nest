import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Model,
  Table,
  HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { EventCategory } from 'src/event-categories/entities/event-category.entity';
import { Favourite } from 'src/favourites/entities/favourite.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Table
export class Event extends Model<Event> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  name: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  @ApiProperty()
  pics: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  price: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @ApiProperty()
  startDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  @ApiProperty()
  endDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  location: string;

  @Column({
    type: DataType.STRING(1000),
    allowNull: false,
  })
  @ApiProperty()
  description: string;

  @Column({
    type: DataType.STRING(),
    allowNull: true,
  })
  @ApiProperty()
  phone: string;

  @Column({
    type: DataType.STRING(),
    allowNull: true,
  })
  @ApiProperty()
  website: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  @ApiProperty()
  isInternal: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  @ApiProperty()
  seats: number;

  @BelongsTo(() => EventCategory)
  category: EventCategory;

  @ForeignKey(() => EventCategory)
  categoryId: number;

  @HasMany(() => Favourite)
  favourites: Favourite;

  @HasMany(() => Transaction)
  transactions: Transaction;
}
