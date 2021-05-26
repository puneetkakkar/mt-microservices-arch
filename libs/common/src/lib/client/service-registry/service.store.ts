import { Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'events';
import { ServiceStatus } from '../../constants';
import { ServiceInstance } from '../../interfaces/service-instance.interface';

export class ServiceStore extends EventEmitter implements OnModuleDestroy {
  private readonly services: Map<string, ServiceInstance[]> = new Map();
  private eventName = 'change';

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

  setServices(name: string, services: ServiceInstance[]): void {
    this.services.set(name, services || []);
    this.emit(this.eventName, 'added', name, services);
  }

  removeService(name: string): void {
    Logger.log(`REMOVE_SERVICE - ${this.services.has(name)} - ${name}`);
    if (this.services.has(name)) {
      this.emit(this.eventName, 'removed', name, this.services.get(name));
      this.services.delete(name);
    }
  }

  removeServiceNode(serviceName: string, nodeId: string): void {
    Logger.log(`REMOVE_SERVICE_NNODE - ${serviceName}`);

    try {
      if (this.services.has(serviceName)) {
        if (this.services.get(serviceName).length === 1) {
          this.emit(
            this.eventName,
            'removed',
            serviceName,
            this.services.get(serviceName)
          );
          this.services.delete(serviceName);
        } else {
          const idx = this.services
            .get(serviceName)
            .findIndex((elem) => elem.getInstanceId() === nodeId);

          if (idx !== -1) {
            const service = this.services.get(serviceName).splice(idx, 1);
            this.emit(this.eventName, 'removed', serviceName, [service]);
          }
        }
      }
    } catch (e) {
      Logger.error(e);
    }
  }

  close(): void {
    this.removeAllListeners(this.eventName);
  }

  watch(
    callback: (
      type: 'added' | 'removed',
      name: string,
      service: ServiceInstance[]
    ) => void
  ): void {
    this.on(this.eventName, callback);
  }

  onModuleDestroy() {
    this.close();
  }
}
