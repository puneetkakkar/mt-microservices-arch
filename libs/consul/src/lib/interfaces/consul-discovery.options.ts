import { DiscoveryOptions } from '@swft-mt/cloud';

type ConsulDiscoveryOption = {
  scheme?: string;

  failFast?: boolean;

  notes?: string;

  script?: string;

  deregisterCriticalServiceAfter?: string;
};

export type ConsulDiscoveryOptions = DiscoveryOptions & ConsulDiscoveryOption;
