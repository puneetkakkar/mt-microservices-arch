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

  @Get('/service-2')
  async getServiceData() {
    try {
      const svcData = await this.serviceInstance.get('api/');
      return svcData.body;
    } catch (error) {
      return {
        error: 'Service-2 is not available',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('/health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
