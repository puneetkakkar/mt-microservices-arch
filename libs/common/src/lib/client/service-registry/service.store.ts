import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { ServiceStatus } from '../../constants';
import { ServiceInstance } from '../../interfaces/service-instance.interface';
import { IServiceStore } from '../../interfaces/service-store.interface';

@Injectable()
export class ServiceStore extends EventEmitter implements IServiceStore {
  private readonly services: Map<string, ServiceInstance[]> = new Map();
  private eventName = 'change';
  private readonly logger = new Logger(ServiceStore.name);

  getServiceNames(): string[] {
    const names: string[] = [];
    for (const key of this.services.keys()) {
      if (this.services.has(key)) {
        names.push(key);
      }
    }
    return names;
  }

  getServiceNodes(name: string, passing?: boolean): ServiceInstance[] {
    const nodes = this.services.get(name) || [];
    if (passing) {
      return nodes.filter((node) => node.getStatus() === ServiceStatus.PASSING);
    }
    return nodes;
  }

  getServices(): Map<string, ServiceInstance[]> {
    return this.services;
  }

  addService(name: string, service: ServiceInstance, noEmit?: boolean) {
    if (this.services.has(name)) {
      const idx = this.services
        .get(name)
        .findIndex((elem) => elem.getServiceId() === service.getServiceId());
      if (idx !== -1) {
        this.services.get(name)[idx] = service;
      } else {
        this.services.get(name).push(service);
      }
    } else {
      this.services.set(name, [service]);
    }

    if (noEmit) return;
    this.emit(this.eventName, 'added', name, [service]);
  }

  addServices(name: string, services: ServiceInstance[], noEmit?: boolean) {
    if (this.services.has(name)) {
      for (const service of services) {
        this.addService(name, service, noEmit);
      }
    } else {
      this.services.set(name, services);
    }

    this.emit(this.eventName, 'added', name, services);
  }

  setServices(name: string, services: ServiceInstance[]): void {
    this.services.set(name, services || []);
    this.emit(this.eventName, 'added', name, services);
  }

  removeService(name: string): void {
    this.logger.log(`REMOVE_SERVICE - ${this.services.has(name)} - ${name}`);
    if (this.services.has(name)) {
      this.emit(this.eventName, 'removed', name, this.services.get(name));
      this.services.delete(name);
    }
  }

  removeServiceNode(serviceName: string, nodeId: string): void {
    try {
      if (this.services.has(serviceName)) {
        const serviceList = this.services.get(serviceName);
        if ((serviceList?.length ?? 0) === 1) {
          this.emit(this.eventName, 'removed', serviceName, serviceList);
          this.services.delete(serviceName);
        } else if (serviceList) {
          const idx = serviceList.findIndex(
            (elem) => elem.getInstanceId() === nodeId,
          );

          if (idx !== -1) {
            const service = serviceList.splice(idx, 1);
            this.emit(this.eventName, 'removed', serviceName, service);
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  resetStore(): void {
    this.services.clear();
  }

  close(): void {
    this.removeAllListeners(this.eventName);
  }

  watch(
    callback: (
      type: 'added' | 'removed',
      name: string,
      service: ServiceInstance[],
    ) => void,
  ): void {
    this.on(this.eventName, callback);
  }

  onModuleDestroy() {
    this.close();
  }
}
