import { PlainObject, Registration, Service } from '@nexuskit/common';
import { ZookeeperDiscoveryOptions } from './zookeeper-discovery.options';

export class ZookeeperRegistration implements Registration<Service> {
  private newService: Service;
  private discoveryOptions: ZookeeperDiscoveryOptions;

  constructor(
    newService: Service,
    discoveryOptions: ZookeeperDiscoveryOptions,
  ) {
    this.newService = newService;
    this.discoveryOptions = discoveryOptions;
  }

  getService(): Service {
    return this.newService;
  }

  getInstanceId(): string {
    return this.newService.id || '';
  }

  getServiceId(): string {
    return this.newService.name || '';
  }

  getHost(): string {
    return this.newService.address || '';
  }

  getPort(): number {
    return this.newService.port || 0;
  }

  isSecure(): boolean {
    return this.discoveryOptions.scheme === 'https';
  }

  getUri(): string {
    const scheme = this.getScheme();
    return `${scheme}://${this.getHost()}:${this.getPort()}`;
  }

  getScheme(): string {
    return this.discoveryOptions.scheme || 'http';
  }

  getMetadata(): PlainObject {
    return this.newService.metadata || {};
  }

  getNodeID(): string {
    return '';
  }

  getStatus(): string {
    return this.newService.status || '';
  }

  getTags(): string[] {
    return this.newService.tags || [];
  }
}
