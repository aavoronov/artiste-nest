import { Injectable } from '@nestjs/common';
import { CreateJoinRequestDto } from './dto/create-join-request.dto';
import { checkForEmptyFields } from 'src/utils/functions';
import { JoinRequest } from './entities/join-request.entity';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { RoomAccess } from 'src/chat-room-accesses/entities/room-access.entity';
import { ChatRoom } from 'src/chat-rooms/entities/chat-room.entity';

@Injectable()
export class JoinRequestsService {
  async createJoinRequest(createJoinRequestDto: CreateJoinRequestDto) {
    const fields = [
      'firstName',
      'lastName',
      'birthday',
      'occupation',
      'hobbies',
      'joinReason',
      'email',
      'phone',
      'instagram',
      'learnedFrom',
    ];

    if (checkForEmptyFields(createJoinRequestDto, fields)) {
      if (
        await User.findOne({
          where: { email: createJoinRequestDto.email },
        })
      ) {
        throw new Error('Адрес электронной почты занят');
      }

      if (
        await JoinRequest.findOne({
          where: { email: createJoinRequestDto.email },
        })
      ) {
        throw new Error('Заявка с таким адресом электронной почты уже принята');
      }

      const birthday = new Date(createJoinRequestDto.birthday);
      await JoinRequest.create({ ...createJoinRequestDto, birthday: birthday });
    }
    return { status: StatusCodes.OK, text: ReasonPhrases.OK };
  }

  async acceptJoinRequest(body: { id: string; password?: string }) {
    const { id, password } = body;

    const request = await JoinRequest.findOne({ where: { id } });

    if (!request) {
      throw new Error('Заявка уже подтверждена или не существует');
    }

    const generatedPassword = nanoid();

    const salt = bcrypt.genSaltSync();
    const passwordHash = await bcrypt.hash(password || generatedPassword, salt);

    const user = await User.create({
      email: request.email,
      password: passwordHash,
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
    });

    const rrChat = await ChatRoom.findOne({ where: { name: 'Artiste club' } });

    await RoomAccess.create({ userId: user.id, roomId: rrChat.id });

    await request.destroy();
    return {
      email: request.email,
      password: password || generatedPassword,
    };
  }
}
