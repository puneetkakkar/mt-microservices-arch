import { Logger } from '@nestjs/common';
import { HeartbeatTask } from '@nexuskit/common';
import { ZookeeperClient } from '../zookeeper.client';

export class ZookeeperHeartbeatTask implements HeartbeatTask {
  logger = new Logger(ZookeeperHeartbeatTask.name);
  private readonly checkId: string;

  constructor(
    private client: ZookeeperClient,
    serviceId: string | null | undefined,
  ) {
    // Handle null/undefined values properly
    const id = serviceId || 'unknown';
    this.checkId = id.startsWith('service:') ? id : `service:${id}`;
  }

  run() {
    try {
      this.logger.log(`Sending zookeeper heartbeat for: ${this.checkId}`);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
