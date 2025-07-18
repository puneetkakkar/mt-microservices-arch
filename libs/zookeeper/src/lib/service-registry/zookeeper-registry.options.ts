import { HeartbeatOptions, Service } from '@nexuskit/common';
import { ZookeeperDiscoveryOptions } from './zookeeper-discovery.options';

export interface ZookeeperRegistryOptions {
  service: Service;
  discovery?: ZookeeperDiscoveryOptions;
  heartbeat?: HeartbeatOptions;
}
