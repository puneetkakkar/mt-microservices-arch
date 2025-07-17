import { ServiceInstance } from '../../interfaces';

export interface DiscoveryClient {
  description(): string;
  getInstances(serviceId: string): Promise<ServiceInstance[]>;
  getAllInstances(): Promise<ServiceInstance[]>;
  getServices(): Promise<string[]>;
}
