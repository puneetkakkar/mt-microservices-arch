import { DiscoveryOptions } from '@nexuskit/common';

type ZookeeperDiscoveryOption = {
  scheme?: string;
  failFast?: boolean;
};

export type ZookeeperDiscoveryOptions = DiscoveryOptions &
  ZookeeperDiscoveryOption;
