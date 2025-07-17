import { Logger } from '@nestjs/common';
import { HeartbeatTask } from '@swft-mt/common';
import { ZookeeperClient } from '../zookeeper.client';

export class ZookeeperHeartbeatTask implements HeartbeatTask {
  logger = new Logger(ZookeeperHeartbeatTask.name);
  private readonly checkId: string;

  constructor(
    private client: ZookeeperClient,
    serviceId: string,
  ) {
    this.checkId = serviceId;
    if (!this.checkId.startsWith('service:')) {
      this.checkId = `service:${this.checkId}`;
    }
  }

  run() {
    try {
      this.logger.log(`Sending zookeeper heartbeat for: ${this.checkId}`);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
