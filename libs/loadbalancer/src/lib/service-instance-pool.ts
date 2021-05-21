import { ServiceInstance } from '@swft-mt/common';

export class ServiceInstancePool {
  constructor(
    private readonly serviceName: string,
    private readonly nodes: Array<ServiceInstance & { weight?: number }>
  ) {}

  get serviceId(): string {
    return this.serviceName;
  }

  get(): Array<ServiceInstance & { weight?: number }> {
    return this.nodes;
  }
}
