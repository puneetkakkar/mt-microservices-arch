import { HeartbeatOptions, Service } from '@swft-mt/common';
import { ZookeeperDiscoveryOptions } from './zookeeper-discovery.options';

export interface ZookeeperRegistryOptions {
  service: Service;
  discovery?: ZookeeperDiscoveryOptions;
  heartbeat?: HeartbeatOptions;
}
