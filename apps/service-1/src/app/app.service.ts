import { Injectable } from '@nestjs/common';
import { BootConfig } from '@swft-mt/bootstrap';

@Injectable()
export class AppService {
  constructor(private readonly bootConfig: BootConfig) {}

  getData(): { message: string } {
    const serviceName = this.bootConfig.get<string>('config.service.name');
    return { message: `Welcome to  ${serviceName} !` };
  }
}
