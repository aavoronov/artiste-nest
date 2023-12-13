import { Injectable } from '@nestjs/common';
import { GenericData } from './entities/generic-data.entity';

@Injectable()
export class GenericDataService {
  async getGenericItem(item: string) {
    const entry = await GenericData.findOne({
      where: { key: item },
      attributes: ['value'],
    });
    return entry;
  }
}
