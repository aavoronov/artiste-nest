import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

export const contacts = ['whatsapp', 'telegram', 'email'] as const;

export type ContactType = (typeof contacts)[number];

@Table
export class JoinRequest extends Model<JoinRequest> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  lastName: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  @ApiProperty()
  birthday: Date;

  @Column({
    type: DataType.STRING(1000),
    allowNull: false,
  })
  @ApiProperty()
  occupation: string;

  @Column({
    type: DataType.STRING(1000),
    allowNull: false,
  })
  @ApiProperty()
  hobbies: string;

  @Column({
    type: DataType.STRING(1000),
    allowNull: false,
  })
  @ApiProperty()
  joinReason: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  instagram: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  learnedFrom: string;

  @Column({
    type: DataType.ENUM(...contacts),
    allowNull: false,
  })
  @ApiProperty()
  contact: ContactType;
}
