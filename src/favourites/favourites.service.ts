import { Injectable } from '@nestjs/common';
import { Favourite } from './entities/favourite.entity';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { Event } from 'src/events/entities/event.entity';

@Injectable()
export class FavouritesService {
  async toggleFavourite(body: { eventId: number; userId: number }) {
    console.log(body);
    const { eventId, userId } = body;

    const fave = await Favourite.findOne({
      where: { eventId: eventId, userId: userId },
    });

    if (!!fave) {
      console.log('there was');
      await fave.destroy();
    } else {
      console.log('there wasnt');
      await Favourite.create({ eventId: eventId, userId: userId });
    }
    return { status: StatusCodes.CREATED, text: ReasonPhrases.CREATED };
  }

  async getMyFavourites(userId: number) {
    const faves = await Favourite.findAll({
      where: { userId: userId },
      attributes: ['id'],
      include: [{ model: Event }],
      order: [['id', 'DESC']],
    });
    return faves;
  }
}
