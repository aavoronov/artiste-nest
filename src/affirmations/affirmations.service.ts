import { Injectable } from '@nestjs/common';
import { Affirmation } from './entities/affirmation.entity';

@Injectable()
export class AffirmationsService {
  async getTodaysAffirmation() {
    return await Affirmation.findOne({
      where: { isToday: true },
      attributes: ['text'],
    });
  }
}
