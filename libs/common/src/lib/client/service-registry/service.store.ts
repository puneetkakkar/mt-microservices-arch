import { OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'events';
import { ServiceStatus } from '../../constants';
import { ServiceInstance } from '../../interfaces/service-instance.interface';

export class ServiceStore extends EventEmitter implements OnModuleDestroy {
  private readonly services: Map<string, ServiceInstance[]> = new Map();

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

  onModuleDestroy() {}
}
