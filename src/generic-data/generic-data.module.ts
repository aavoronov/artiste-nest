import { Module } from '@nestjs/common';
import { GenericDataService } from './generic-data.service';
import { GenericDataController } from './generic-data.controller';

@Module({
  controllers: [GenericDataController],
  providers: [GenericDataService],
})
export class GenericDataModule {}
