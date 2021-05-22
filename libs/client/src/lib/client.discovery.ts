import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ClientOrchestrator } from './client-orchestrator';
import { MetadataAccessor } from './metadata.accessor';

@Injectable()
export class ClientDiscovery implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: MetadataAccessor,
    private readonly clientOrchestrator: ClientOrchestrator
  ) {}

  discover() {
    const providers: InstanceWrapper[] = [
      ...this.discoveryService.getProviders(),
      ...this.discoveryService.getControllers(),
    ];
    providers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (!instance || typeof instance === 'string') {
        return;
      }
      this.lookupKeyValues(instance);
    });
  }

  lookupKeyValues(instance: Function) {
    const clients = this.metadataAccessor.getAllServices(instance);
    if (clients) {
      this.clientOrchestrator.addClients(instance, clients);
    }
  }

  onModuleInit() {
    this.discover();
  }
}
