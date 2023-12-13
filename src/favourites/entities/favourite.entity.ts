import { BelongsTo, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Event } from 'src/events/entities/event.entity';
import { User } from 'src/users/entities/user.entity';

@Table
export class Favourite extends Model<Favourite> {
  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  userId: number;

  @BelongsTo(() => Event)
  event: Event;

  @ForeignKey(() => Event)
  eventId: number;
}
