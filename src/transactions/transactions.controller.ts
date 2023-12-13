import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  bookAnEvent(
    @Body() body: { userId: number; eventId: number; ticketsAmount: number },
  ) {
    return this.transactionsService.bookAnEvent(body);
  }

  @Get('events')
  getMyBookedEvents(
    @Body() body: { userId: number },
    @Query() queries: Record<string, string>,
  ) {
    return this.transactionsService.getMyBookedEvents(body.userId, queries);
  }

  @Get()
  getMyTransactions(
    @Body() body: { userId: number },
    @Query() queries: Record<string, string>,
  ) {
    return this.transactionsService.getMyTransactions(body.userId, queries);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }
}
