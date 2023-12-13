import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Notification extends Model<Notification> {
  @Column({
    type: DataType.STRING(1000),
    allowNull: false,
  })
  @ApiProperty()
  text: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  @ApiProperty()
  pic: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  @ApiProperty()
  userId: number;
}
