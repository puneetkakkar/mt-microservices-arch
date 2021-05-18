import { DiscoveryOptions } from './discovery-options.interface';
import { HeartbeatOptions } from './heartbeat-options.interface';
import { Service } from './service.interface';

export interface BaseRegistryOption {
  service: Omit<Service, 'checks' | 'region'>;
  discovery?: DiscoveryOptions;
  heartbeat?: HeartbeatOptions;
}

export interface ConsulRegistryProviderOptions extends BaseRegistryOption {
  discoverer: 'consul';
}
