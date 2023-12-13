import {
  HttpException,
  Injectable,
  NestMiddleware,
  Next,
  Req,
  Res,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as jwt from 'jsonwebtoken';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  // constructor(@InjectModel(User) private userModel: typeof User) {}
  async use(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    if (req.body.role !== 'admin') {
      throw new HttpException('Нет доступа к ресурсу', StatusCodes.FORBIDDEN, {
        cause: new Error('Some Error'),
      });
    }
    return next();
  }
  catch(e) {
    // req.body = { ...req.body, access: false };
    throw new HttpException('Нет доступа к ресурсу', StatusCodes.UNAUTHORIZED);
  }
}
