import { DiscoveryOptions, Service } from '@swft-mt/common';
import { HeartbeatOptions } from './heartbeat-options.interface';

export interface BaseRegistryOption {
  service: Omit<Service, 'checks' | 'region'>;
  discovery?: DiscoveryOptions;
  heartbeat?: HeartbeatOptions;
}

export interface ConsulRegistryProviderOptions extends BaseRegistryOption {
  discoverer: 'consul';
}
