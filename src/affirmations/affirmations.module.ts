import { Module } from '@nestjs/common';
import { AffirmationsService } from './affirmations.service';
import { AffirmationsController } from './affirmations.controller';

@Module({
  controllers: [AffirmationsController],
  providers: [AffirmationsService],
})
export class AffirmationsModule {}
