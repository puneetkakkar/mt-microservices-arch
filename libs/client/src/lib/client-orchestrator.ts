import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LoadBalancerClient } from '@swft-mt/loadbalancer';
import { ClientFactory } from './client.factory';
import { Client } from './interfaces';
import { ClientMetadata } from './interfaces/client-metadata.interface';

@Injectable()
export class ClientOrchestrator implements OnApplicationBootstrap {
  private readonly clients = new Map<string, Client>();

  constructor(private readonly lb: LoadBalancerClient) {}

  public addClients(target: Function, clients: ClientMetadata[]) {
    clients.forEach(({ property, options }) => {
      const key = `${property}__${target.constructor.name}`;
      this.clients.set(key, { property, target, options });
    });
  }

  private async mountClients() {
    for (const item of this.clients.values()) {
      const { property, target, options } = item;
      Object.defineProperty(target, property, {
        get: () => {
          return ClientFactory.create(this.lb, options);
        },
      });
    }
  }

  async onApplicationBootstrap() {
    await this.mountClients();
  }
}
