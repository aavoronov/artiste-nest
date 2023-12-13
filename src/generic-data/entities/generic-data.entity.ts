import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class GenericData extends Model<GenericData> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  key: string;

  @Column({
    type: DataType.STRING(1000),
    allowNull: false,
  })
  value: string;
}
