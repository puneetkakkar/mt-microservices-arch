import { DiscoveryOptions } from '@swft-mt/common';

type ConsulDiscoveryOption = {
  scheme?: string;

  failFast?: boolean;

  notes?: string;

  script?: string;

  deregisterCriticalServiceAfter?: string;
};

export type ConsulDiscoveryOptions = DiscoveryOptions & ConsulDiscoveryOption;
