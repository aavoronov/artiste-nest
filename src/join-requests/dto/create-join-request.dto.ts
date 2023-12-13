import { ContactType } from '../entities/join-request.entity';

export class CreateJoinRequestDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly birthday: string;
  readonly occupation: string;
  readonly hobbies: string;
  readonly joinReason: string;
  readonly email: string;
  readonly phone: string;
  readonly instagram: string;
  readonly learnedFrom: string;
  readonly contact: ContactType;
}
