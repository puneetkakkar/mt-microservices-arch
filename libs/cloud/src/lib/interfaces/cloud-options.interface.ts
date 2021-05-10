import { ConsulRegistryProviderOptions } from './registry-options.interface';

export type RegistryConfiguration = ConsulRegistryProviderOptions;

export interface CloudModuleOptions {
  registry: RegistryConfiguration;
}
