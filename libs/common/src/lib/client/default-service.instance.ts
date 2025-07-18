import { ServiceInstanceState } from '../health';
import { ServiceInstance } from '../interfaces';
import { PlainObject } from '../utils';
import { ServiceInstanceOptions } from './service-instance.options';

export class DefaultServiceInstance implements ServiceInstance {
  state: ServiceInstanceState;

  constructor(private opts: ServiceInstanceOptions) {
    this.state = opts.state || new ServiceInstanceState();
  }

  getState(): ServiceInstanceState {
    return this.state;
  }

  getInstanceId(): string {
    return this.opts.instanceId;
  }

  getServiceId(): string {
    return this.opts.serviceId;
  }

  getHost(): string {
    return this.opts.host;
  }

  getPort(): number {
    return this.opts.port;
  }

  getTags(): string[] {
    return this.opts.tags || [];
  }

  getStatus(): string {
    return this.opts.status || 'unknown';
  }

  getNodeID(): string {
    return this.opts.nodeID || this.opts.instanceId;
  }

  isSecure(): boolean {
    return this.opts.secure;
  }

  getUri(): string {
    const scheme = this.getScheme();

    return `${scheme}://${this.getHost()}:${this.getPort()}`;
  }

  getScheme(): string {
    return this.isSecure() ? 'https' : 'http';
  }

  getMetadata(): PlainObject {
    if (this.opts.metadata instanceof Map) {
      return Object.fromEntries(this.opts.metadata);
    }

    return this.opts.metadata || {};
  }
}
