import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { readFileSync } from 'fs';
import { ServerOptions, Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  message: (payload: any) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

interface AppServer<
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
> extends Server<
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData
  > {
  username?: string;
}

interface AppSocket<
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
> extends Socket<
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData
  > {
  username?: string;
  sessionID: string;
  userID: string;
}

export class SocketIOAdapter extends IoAdapter {
  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    console.warn('constructor');
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort = parseInt(process.env.CLIENT_PORT);

    const cors = {
      origin: [`${process.env.CLIENT_URL}`],
    };
    // const cors = true;

    let httpsOptions;

    if (process.env.ENV === 'prod') {
      httpsOptions = {
        key: readFileSync(`${process.env.LETSENCRYPT_DIR}/privkey.pem`),
        cert: readFileSync(`${process.env.LETSENCRYPT_DIR}/cert.pem`),
        ca: readFileSync(`${process.env.LETSENCRYPT_DIR}/chain.pem`),

        requestCert: false,
        rejectUnauthorized: false,
      };
      console.log('first', process.env.LETSENCRYPT_DIR);
    }

    // // console.log(`${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}`);
    // ...httpsOptions,

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };

    return super.createIOServer(port, optionsWithCORS);
  }
}

// export
// class SocketIOAdapter_old extends IoAdapter {
//   constructor(
//     private app: INestApplicationContext,
//     private configService: ConfigService,
//   ) {
//     super(app);
//   }
//   createIOServer(port: number, options?: ServerOptions) {
//     const clientPort = parseInt(process.env.CLIENT_PORT);

//     const cors = {
//       origin: [`${process.env.CLIENT_URL}`],
//       // origin: `*`,
//     };
//     // const cors = true;

//     let httpsOptions;

//     if (process.env.ENV === 'prod') {
//       httpsOptions = {
//         key: readFileSync(`${process.env.LETSENCRYPT_DIR}/privkey.pem`),
//         cert: readFileSync(`${process.env.LETSENCRYPT_DIR}/cert.pem`),
//         ca: readFileSync(`${process.env.LETSENCRYPT_DIR}/chain.pem`),

//         requestCert: false,
//         rejectUnauthorized: false,
//       };
//       console.log('first', process.env.LETSENCRYPT_DIR);
//     }

//     // // console.log(`${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}`);
//     // ...httpsOptions,

//     const optionsWithCORS: ServerOptions = {
//       ...options,
//       cors,
//     };

//     const server: Server<
//       ClientToServerEvents,
//       ServerToClientEvents,
//       InterServerEvents,
//       SocketData
//     > = super.createIOServer(port, optionsWithCORS);

//     server.use(async (socket, next) => {
//       const token = socket.handshake.auth.token;

//       if (!token) {
//         // req.body = { ...req.body, access: false };
//         return next(new Error('No token privided'));
//         // return next();
//       }
//       const result = jwt.verify(token, process.env.JWT);

//       if (!!result.message) {
//         return next(new Error('Сессия истекла или недействительна'));
//       }

//       // console.log(user);

//       const user = await User.findOne({
//         where: { login: result.login },
//       });

//       if (!user) {
//         // if (!user || !user.verification) {
//         return next(new Error('Нет доступа к ресурсу'));
//       }

//       if (user.isBlocked) {
//         return next(new Error('Аккаунт заблокирован'));
//       }

//       if (user.isDeleted) {
//         return next(new Error('Аккаунт удален'));
//       }

//       // @ts-ignore
//       socket.userId = user.id;

//       next();
//     });

//     return server;
//   }
// }
