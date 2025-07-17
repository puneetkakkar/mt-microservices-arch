import { Logger } from '@nestjs/common';
import { DiscoveryClient, PlainObject, ServiceInstance } from '@swft-mt/common';
import _ from 'lodash';
import { ZookeeperClient } from '../zookeeper.client';
import { ZookeeperServiceInstance } from './zookeeper-service.instance';

export class ZookeeperDiscoveryClient implements DiscoveryClient {
  logger = new Logger(ZookeeperDiscoveryClient.name);
  private readonly namespace = '/swft-mt-service';

  constructor(private readonly client: ZookeeperClient) {}

  async init() {
    this.logger.log('ZookeeperDiscoveryClient initiated');
  }

  description(): string {
    return 'Zookeeper Discovery Client';
  }

  async getInstances(serviceId: string): Promise<ServiceInstance[]> {
    return this.addInstancesToList(serviceId);
  }

  private async addInstancesToList(
    serviceId: string,
  ): Promise<ServiceInstance[]> {
    const healthServices: any[] = [];
    return healthServices.map((healthService) => {
      const host = this.findHost(healthService);
      const metadata = this.getMetadata(healthService.Service.Tags || []);
      let secure = false;
      if (metadata?.['secure']) {
        secure = /true/i.test(metadata['secure'] || '');
      }

      return new ZookeeperServiceInstance({
        instanceId: healthService.Service.ID,
        serviceId,
        host,
        port: healthService.Service.Port,
        secure,
        metadata,
      });
    });
  }

  private findHost(healthService: any): string {
    const service = healthService.Service;
    const node = healthService.Node;

    if (service.Address) {
      return service.Address;
    } else if (node.Address) {
      return node.Address;
    }

    return node.Node;
  }

  private getMetadata(tags: string[]): PlainObject {
    return {};
  }

  async getAllInstances(): Promise<ServiceInstance[]> {
    const services = await this.getServices();
    const allServices = await Promise.all(
      services.map((serviceId) => this.addInstancesToList(serviceId)),
    );

    return _.flatten(allServices);
  }

  async getServices(): Promise<string[]> {
    const services = await this.client.get_children(this.namespace, false);
    return Object.keys(services);
  }
}
