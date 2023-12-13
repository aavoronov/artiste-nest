import { HttpException, Injectable } from '@nestjs/common';
import { IPasswordRestore } from './interfaces/email.body';

import * as dotenv from 'dotenv';
import { createTransport } from 'nodemailer';

dotenv.config();

// const user = process.env.MAILER_USER;
// const pass = process.env.MAILER_PASSWORD;

@Injectable()
export class MailerService {
  user = process.env.MAILER_USER;
  postfix = process.env.MAILER_USER_POSTFIX;
  pass = process.env.MAILER_PASSWORD;
  host = process.env.MAILER_HOST;
  port = process.env.MAILER_PORT;
  sender = process.env.MAILER_SENDER;
  apiUrl = process.env.API_URL;

  // transporter = createTransport({
  //   host: 'smtp.yandex.ru',
  //   port: 465,
  //   //   service: "mail",
  //   secure: true,
  //   auth: {
  //     user: this.user + '@yandex.ru',
  //     pass: this.pass,
  //   },
  // });

  transporter = createTransport({
    host: this.host,
    port: this.port,
    secure: true,
    auth: {
      user: this.user + this.postfix,
      pass: this.pass,
    },
  });

  async restorePasswordMail(body: IPasswordRestore) {
    try {
      const output = `
            <p>Новый пароль от вашей учетной записи Artiste:</p>
            <p>${body.newPassword}</p>
        `;
      const mailOptions = {
        from: `${this.sender} <${this.user}${this.postfix}>`,
        to: body.email,
        subject: 'Восстановление пароля к аккаунту',
        html: output,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (e) {
      throw new HttpException(e.message, e.status, {
        cause: new Error('Some Error'),
      });
    }
  }
}
