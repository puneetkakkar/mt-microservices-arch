import { Controller, Get } from '@nestjs/common';
import { Service1Service } from './service-1.service';

@Controller()
export class Service1Controller {
  constructor(private readonly service1Service: Service1Service) {}

  @Get()
  getHello(): string {
    return this.service1Service.getHello();
  }
}
