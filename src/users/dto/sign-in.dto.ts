import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ required: true })
  readonly email: string;

  @ApiProperty({ required: true })
  readonly password: string;
}
