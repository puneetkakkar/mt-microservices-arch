import { Injectable } from '@nestjs/common';

@Injectable()
export class Service1Service {
  getHello(): string {
    return 'Hello World!';
  }
}
