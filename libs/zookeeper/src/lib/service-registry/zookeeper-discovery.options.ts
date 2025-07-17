import { DiscoveryOptions } from '@swft-mt/common';

type ZookeeperDiscoveryOption = {
  scheme?: string;
  failFast?: boolean;
};

export type ZookeeperDiscoveryOptions = DiscoveryOptions &
  ZookeeperDiscoveryOption;
