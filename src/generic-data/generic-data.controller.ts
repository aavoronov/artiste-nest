import { Controller, Get, Param } from '@nestjs/common';
import { GenericDataService } from './generic-data.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('generic-data')
@Controller('generic-data')
export class GenericDataController {
  constructor(private readonly genericDataService: GenericDataService) {}

  @Get(':item')
  getGenericItem(@Param('item') item: string) {
    return this.genericDataService.getGenericItem(item);
  }
}
