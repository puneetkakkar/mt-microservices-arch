import { Injectable } from '@nestjs/common';
import { BootConfig } from '@swft-mt/bootstrap';

@Injectable()
export class AppService {
  constructor(private readonly bootConfig: BootConfig) {}

  getData(): { message: string } {
    return { message: 'Welcome to service-1!' };
  }
}
