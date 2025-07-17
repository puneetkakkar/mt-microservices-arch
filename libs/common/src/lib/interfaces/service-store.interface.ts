import { ServiceInstance } from './service-instance.interface';

export interface IServiceStore {
  getServices(): Map<string, ServiceInstance[]>;
  getServiceNames(): string[];
  getServiceNodes(name: string, passing?: boolean): ServiceInstance[];
  addService(name: string, service: ServiceInstance, noEmit?: boolean): void;
  addServices(
    name: string,
    services: ServiceInstance[],
    noEmit?: boolean,
  ): void;
  setServices(name: string, services: ServiceInstance[]): void;
  removeService(name: string): void;
  removeServiceNode(serviceName: string, nodeId: string): void;
  watch(
    callback: (
      type: 'added' | 'removed',
      name: string,
      service: ServiceInstance[],
    ) => void,
  ): void;
  close(): void;
  resetStore(): void;
}
