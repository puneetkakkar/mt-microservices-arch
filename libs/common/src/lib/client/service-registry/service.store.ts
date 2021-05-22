import { OnModuleDestroy } from '@nestjs/common';
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
