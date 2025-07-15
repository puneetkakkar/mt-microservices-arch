import { BaseClientOptions } from '@swft-mt/common';

export interface ZookeeperModuleOptions extends BaseClientOptions {
  host: string;
  timeout?: number;
  logLevel?: number;
  hostOrderDeterministic?: boolean;

  useCluster?: boolean;
}
