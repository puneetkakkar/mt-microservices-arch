import { DiscoveryOptions, Service } from '@nexuskit/common';
import { HeartbeatOptions } from './heartbeat-options.interface';

export interface BaseRegistryOption {
  service: Omit<Service, 'checks' | 'region'>;
  discovery?: DiscoveryOptions;
  heartbeat?: HeartbeatOptions;
}

export interface ConsulRegistryProviderOptions extends BaseRegistryOption {
  discoverer: 'consul';
}

export interface ZookeeperRegistryProviderOptions extends BaseRegistryOption {
  discoverer: 'zookeeper';
}
