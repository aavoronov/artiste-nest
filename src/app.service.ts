import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getFile(path: string[], res: any): any {
    const parts = `${path['slug'] + path[0]}`.split('/');
    const dir = parts.slice(0, -1).join('/');
    const slug = parts[parts.length - 1];

    return res.sendFile(slug, { root: `./uploads/` + dir + '/' });
  }
}
