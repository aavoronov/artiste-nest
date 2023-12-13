import { Controller, Get } from '@nestjs/common';
import { AffirmationsService } from './affirmations.service';

@Controller('affirmations')
export class AffirmationsController {
  constructor(private readonly affirmationsService: AffirmationsService) {}

  @Get()
  getTodaysAffirmation() {
    return this.affirmationsService.getTodaysAffirmation();
  }
}
