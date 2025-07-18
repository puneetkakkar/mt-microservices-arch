import { DiscoveryOptions } from '@nexuskit/common';

type ConsulDiscoveryOption = {
  scheme?: string;

  failFast?: boolean;

  notes?: string;

  script?: string;

  deregisterCriticalServiceAfter?: string;
};

export type ConsulDiscoveryOptions = DiscoveryOptions & ConsulDiscoveryOption;
