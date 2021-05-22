import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ClientOrchestrator } from './client-orchestrator';
import { ClientDiscovery } from './client.discovery';
import { MetadataAccessor } from './metadata.accessor';

@Module({
  imports: [DiscoveryModule],
  providers: [MetadataAccessor, ClientOrchestrator],
})
export class ClientModule {
  static forRoot(): DynamicModule {
    return {
      module: ClientModule,
      providers: [ClientDiscovery],
    };
  }
}
