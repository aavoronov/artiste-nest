import * as dotenv from 'dotenv';

dotenv.config();

export class MailerConfig {
  createMailerOptions() {
    return {
      host: process.env.MAILER_HOST,
      port: parseInt(process.env.MAILER_PORT),
      secure: true,
      auth: {
        user: process.env.MAILER_USER + process.env.MAILER_USER_POSTFIX,
        pass: process.env.MAILER_PASSWORD,
      },
      url: process.env.API_URL,
    };
  }
}
