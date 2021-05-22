import { Controller, Get } from '@nestjs/common';
import { HttpClient, HttpServiceClient } from '@swft-mt/client';
import { AppService } from './app.service';

@Controller()
export class AppController {
  @HttpServiceClient('service-2')
  serviceInstance: HttpClient;

  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('/hit-service-2')
  async hitAnotherService() {
    const otherSvc = await this.serviceInstance.get('/');
    console.log('OTHER_SERVICE', otherSvc.body);

    return otherSvc.body;
  }
}
