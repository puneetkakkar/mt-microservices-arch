import { Logger } from '@nestjs/common';
import { ConsulClient } from '../consul.client';
import { HeartbeatTask } from '../interfaces';

export class ConsulHeartbeatTask implements HeartbeatTask {
  private readonly checkId: string;

  constructor(private client: ConsulClient, serviceId: string) {
    this.checkId = serviceId;
    if (!this.checkId.startsWith('service:')) {
      this.checkId = `service:${this.checkId}`;
    }
  }

  run() {
    try {
      (async () => {
        this.client.consul.agent.check.pass(this.checkId);
        Logger.log(`Sending consul heartbeat for: ${this.checkId}`);
      })();
    } catch (error) {
      Logger.error(error);
    }
  }
}
