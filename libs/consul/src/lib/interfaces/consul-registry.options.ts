import { Service } from '@swft-mt/cloud';
import { ConsulDiscoveryOptions } from './consul-discovery.options';
import { HeartbeatOptions } from './heartbeat.interface';

export interface ConsulRegistryOptions {
  service: Service;
  discovery?: ConsulDiscoveryOptions;
  heartbeat?: HeartbeatOptions;
}
