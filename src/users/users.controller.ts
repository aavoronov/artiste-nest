import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-in')
  signIn(@Body() body: SignInDto) {
    return this.usersService.signIn(body);
  }

  @Get('reauth')
  reauthorize(@Body() body: { userId: number }) {
    return this.usersService.reauthorize(body.userId);
  }

  @Post('password')
  changePassword(
    @Body() body: { userId: number; oldPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(body);
  }

  @Get('forgot-password')
  forgotPassword(@Body() body: { userId: number }) {
    return this.usersService.forgotPassword(body.userId);
  }

  @Get('all')
  getAllUsers(@Query() queries: Record<string, string>) {
    return this.usersService.getAllUsers(queries);
  }

  @Get(':id')
  getOneUser(@Param('id') id: string) {
    return this.usersService.getOneUser(+id);
  }

  @Patch()
  @UseInterceptors(FilesInterceptor('files'))
  updateUserData(
    @Headers('Authorization') token: string,
    @Body()
    body: {
      nickname?: string;
      firstName?: string;
      lastName?: string;
      phoneHidden?: boolean;
      about?: string;
    },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.usersService.updateUserData(token, body, files);
  }
}
