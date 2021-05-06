import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

@Injectable()
export class BootstrapDiscovery implements OnModuleInit {
  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    this.discover();
  }

  discover() {
    const providers: InstanceWrapper[] = [
      ...this.discoveryService.getProviders(),
    ];
  }
}
