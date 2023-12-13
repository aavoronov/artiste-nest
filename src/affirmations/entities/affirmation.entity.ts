import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Affirmation extends Model<Affirmation> {
  @Column({
    type: DataType.STRING(1000),
    allowNull: false,
  })
  @ApiProperty()
  text: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  @ApiProperty()
  isToday: boolean;
}
