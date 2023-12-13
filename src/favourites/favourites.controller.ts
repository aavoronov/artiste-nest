import { Body, Controller, Get, Post } from '@nestjs/common';
import { FavouritesService } from './favourites.service';

@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Post()
  toggleFavourite(@Body() body: { eventId: number; userId: number }) {
    return this.favouritesService.toggleFavourite(body);
  }

  @Get()
  getMyFavourites(@Body() body: { userId: number }) {
    return this.favouritesService.getMyFavourites(body.userId);
  }
}
