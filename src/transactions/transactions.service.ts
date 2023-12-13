import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize';
import { Event } from 'src/events/entities/event.entity';
import { Transaction } from './entities/transaction.entity';
import { getWhereClause } from 'src/utils/functions';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

@Injectable()
export class TransactionsService {
  async bookAnEvent(body: {
    userId: number;
    eventId: number;
    ticketsAmount: number;
  }) {
    const { userId, eventId, ticketsAmount } = body;
    const event = await Event.findOne({ where: { id: eventId } });

    const seatsBooked = await Transaction.findAll({
      where: { eventId },
      attributes: [
        [
          Sequelize.fn('SUM', Sequelize.col('Transaction.ticketsAmount')),
          'ticketsAmount',
        ],
      ],
    });

    console.log(seatsBooked);

    const seatsLeft = event.seats - seatsBooked[0].ticketsAmount;

    if (!event.isInternal) {
      throw new Error('Невозможно забронировать внешнее мероприятие');
    }

    if (event.seats === null) {
      throw new Error('Это мероприятие со свободным входом');
    }

    if (seatsLeft <= 0) {
      throw new Error('Места на мероприятие распроданы');
    }

    if (seatsLeft < ticketsAmount) {
      throw new Error('Вы пытаетесь купить больше мест, чем сейчас доступно');
    }

    const transaction = await Transaction.create({
      userId: userId,
      eventId: eventId,
      ticketsAmount: ticketsAmount,
      sum: parseFloat(event.price) * ticketsAmount,
    });

    if (!!transaction) {
    }

    return { status: StatusCodes.CREATED, text: ReasonPhrases.CREATED };
  }

  async getMyBookedEvents(userId: number, queries: Record<string, string>) {
    const { whereClause } = getWhereClause({ queries });

    const transactions = await Event.findAll({
      where: whereClause,
      attributes: {
        include: [
          [
            Sequelize.fn('SUM', Sequelize.col('transactions.ticketsAmount')),
            'ticketsAmount',
          ],
        ],
      },
      include: [
        {
          model: Transaction,
          where: { userId: userId },
          attributes: [],
          // limit: 1,
          required: true,
        },
      ],
      // order: [['transactions.id', 'DESC']],
      group: ['Event.id'],
    });
    return transactions;
  }

  async getMyTransactions(userId: number, queries: Record<string, string>) {
    const { whereClause } = getWhereClause({ queries, initial: { userId } });
    const transactions = await Transaction.findAll({
      where: whereClause,
      include: [{ model: Event }],
      attributes: ['sum', 'ticketsAmount', 'createdAt'],
      order: [['id', 'DESC']],
    });

    return transactions;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }
}
