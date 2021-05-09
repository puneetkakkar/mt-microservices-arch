import { ConsulOptions } from 'consul';

export interface ConsulModuleOptions extends ConsulOptions {
  aclToken?: string;
  passing?: boolean;
}
