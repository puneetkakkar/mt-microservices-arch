import { HeartbeatOptions, Service } from '@swft-mt/common';
import { ConsulDiscoveryOptions } from './consul-discovery.options';

export interface ConsulRegistryOptions {
  service: Service;
  discovery?: ConsulDiscoveryOptions;
  heartbeat?: HeartbeatOptions;
}
