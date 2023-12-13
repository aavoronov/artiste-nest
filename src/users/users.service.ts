import { HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import * as jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid/non-secure';
import { MailerService } from 'src/mailer/mailer.service';
import { getWhereClause, uploadFiles } from 'src/utils/functions';
import { SignInDto } from './dto/sign-in.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly mailerService: MailerService) {}

  private getSignInResponse(user: User) {
    const accessToken = jwt.sign(user.toJSON(), process.env.JWT, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return {
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      token: accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePics: user.profilePics,
      },
    };
  }

  private validPassword(password: string, userPassword: string) {
    return bcrypt.compareSync(password, userPassword);
  }

  async getUserByToken(token: string) {
    try {
      if (!token) {
        throw new HttpException(
          'Нет доступа к ресурсу',
          StatusCodes.UNAUTHORIZED,
        );
      }
      const result = await jwt.verify(token, process.env.JWT);

      // console.log(result);
      if (!!result.message) {
        throw new HttpException(
          'Сессия истекла или недействительна',
          StatusCodes.FORBIDDEN,
          {
            cause: new Error('Some Error'),
          },
        );
      }
      const user = await User.findOne({
        where: { email: result.email },
      });
      if (!user) {
        throw new HttpException(
          'Пользователь не существует',
          StatusCodes.UNAUTHORIZED,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      if (user.isBlocked) {
        throw new HttpException('Аккаунт заблокирован', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }

      if (user.isDeleted) {
        throw new HttpException('Аккаунт удален', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }
      return user;
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  async signIn(body: SignInDto) {
    const { email, password } = body;

    try {
      if (!email)
        throw new HttpException('Логин не введен', StatusCodes.BAD_REQUEST);
      if (!password)
        throw new HttpException('Пароль не введен', StatusCodes.BAD_REQUEST);

      const user = await User.findOne({
        where: { email },
      });

      let passwordMatches = false;

      if (user && user.isDeleted) {
        throw new HttpException('Аккаунт удален', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }

      if (user && user.isBlocked) {
        throw new HttpException('Аккаунт заблокирован', StatusCodes.FORBIDDEN, {
          cause: new Error('Some Error'),
        });
      }

      if (user) passwordMatches = this.validPassword(password, user.password);

      if (!user || !passwordMatches) {
        throw new HttpException(
          'Неправильный логин или пароль',
          StatusCodes.NOT_FOUND,
          {
            cause: new Error('Some Error'),
          },
        );
      }

      return this.getSignInResponse(user);
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }

  async reauthorize(id: number) {
    try {
      const user = await User.findOne({
        where: { id },
        attributes: { exclude: ['password'] },
      });

      return this.getSignInResponse(user);
    } catch (e) {
      throw new HttpException(e.message, StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
  }

  async changePassword(body: {
    userId: number;
    oldPassword: string;
    newPassword: string;
  }) {
    const { userId, oldPassword, newPassword } = body;
    const user = await User.findOne({ where: { id: userId } });
    if (!this.validPassword(oldPassword, user.password)) {
      throw new Error('Неправильный старый пароль');
    }

    const salt = bcrypt.genSaltSync();
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await User.update({ password: passwordHash }, { where: { id: userId } });

    return { status: StatusCodes.CREATED, text: ReasonPhrases.CREATED };
  }

  async forgotPassword(userId: number) {
    const user = await User.findOne({ where: { id: userId } });
    const newPassword = nanoid();

    const salt = bcrypt.genSaltSync();
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const [changed] = await User.update(
      { password: passwordHash },
      { where: { id: userId } },
    );

    if (!!changed) {
      await this.mailerService.restorePasswordMail({
        email: user.email,
        newPassword: newPassword,
      });
    }

    return { status: StatusCodes.CREATED, text: ReasonPhrases.CREATED };
  }

  async getAllUsers(queries: Record<string, string>) {
    const { whereClause } = getWhereClause({
      queries,
      searchFields: ['firstName', 'lastName'],
    });
    const users = await User.findAll({
      attributes: ['firstName', 'lastName', 'profilePics', 'about'],
      where: whereClause,
    });
    return users;
  }

  async getOneUser(id: number) {
    const user = await User.findOne({
      where: { id: id },
      attributes: [
        'firstName',
        'lastName',
        'nickname',
        'phone',
        'phoneHidden',
        'profilePics',
        'about',
      ],
    });

    const res = user.toJSON();

    if (res.phoneHidden) {
      res.phone = null;
    }
    delete res.phoneHidden;
    return res;
  }

  async updateUserData(
    token: string,
    body: {
      nickname?: string;
      firstName?: string;
      lastName?: string;
      phoneHidden?: boolean;
      about?: string;
    },
    files: Express.Multer.File[],
  ) {
    const user = await this.getUserByToken(token);

    const { nickname, firstName, lastName, phoneHidden, about } = body;

    let pics: string[];
    if (files) {
      if (user.profilePics.length + files.length > 5) {
        throw new Error('Максимум изображений профиля - 5');
      }
      pics = (await uploadFiles(files, '/users')) as string[];
    }
    // await deleteFile(user.pic, '/chat-rooms');

    await user.update({
      nickname,
      firstName,
      lastName,
      phoneHidden,
      about,
      profilePics: [...user.profilePics, ...pics],
    });

    return {
      nickname: user.nickname,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneHidden: user.phoneHidden,
      about: user.about,
      profilePics: user.profilePics,
    };
  }
}
