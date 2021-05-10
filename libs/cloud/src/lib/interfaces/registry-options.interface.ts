import { DiscoveryOptions, HeartbeatOptions, Service } from '@swft-mt/common';

export interface BaseRegistryOption {
  service: Omit<Service, 'checks' | 'region'>;
  discovery?: DiscoveryOptions;
  heartbeat?: HeartbeatOptions;
}

export interface ConsulRegistryProviderOptions extends BaseRegistryOption {
  discoverer: 'consul';
}
