import { Logger } from '@nestjs/common';
import {
  DiscoveryClient,
  PlainObject,
  ServiceInstance,
} from '@nexuskit/common';
import { flatten } from 'lodash';
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
    try {
      // Get all service instances for the given service ID
      const servicePath = `${this.namespace}/${serviceId}`;
      const instances = await this.client.get_children(servicePath, false);

      if (!Array.isArray(instances) || instances.length === 0) {
        return [];
      }

      const serviceInstances: ServiceInstance[] = [];

      for (const instanceId of instances) {
        try {
          const instancePath = `${servicePath}/${instanceId}`;
          const [data] = await this.client.get(instancePath, false);

          if (data) {
            const serviceData = JSON.parse(data.toString());
            const metadata = this.getMetadata(serviceData.tags || []);
            let secure = false;
            if (metadata?.['secure']) {
              secure = /true/i.test(metadata['secure'] || '');
            }

            serviceInstances.push(
              new ZookeeperServiceInstance({
                instanceId: serviceData.id || instanceId,
                serviceId,
                host: serviceData.address || 'localhost',
                port: serviceData.port || 3000,
                secure,
                metadata,
              }),
            );
          }
        } catch (error) {
          this.logger.warn(
            `Failed to fetch service instance ${instanceId}: ${error}`,
          );
        }
      }

      return serviceInstances;
    } catch (error) {
      this.logger.error(
        `Failed to get instances for service ${serviceId}: ${error}`,
      );
      return [];
    }
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

    return flatten(allServices);
  }

  async getServices(): Promise<string[]> {
    const services = await this.client.get_children(this.namespace, false);
    // Handle both array and object responses from zookeeper
    if (Array.isArray(services)) {
      return services;
    }
    return Object.keys(services);
  }
}
