import { BaseClientOptions } from '@swft-mt/common';
import { ConsulOptions } from 'consul';

export interface ConsulModuleOptions extends ConsulOptions, BaseClientOptions {
  aclToken?: string;
  passing?: boolean;
}
