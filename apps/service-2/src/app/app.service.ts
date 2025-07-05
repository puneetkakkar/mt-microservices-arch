import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly instanceId = Math.random().toString(36).substring(7);
  private readonly port = parseInt(process.env.PORT) || 3334;

  getData(): {
    message: string;
    instanceId: string;
    port: number;
    timestamp: string;
  } {
    return {
      message: 'Welcome to service-2!',
      instanceId: this.instanceId,
      port: this.port,
      timestamp: new Date().toISOString(),
    };
  }
}
